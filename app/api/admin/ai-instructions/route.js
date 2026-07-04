import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('ai_rules')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const rules = (data || []).map(r => ({
      id: r.id,
      text: r.text,
      isActive: r.is_active
    }));

    return NextResponse.json({ rules });
  } catch (error) {
    console.error("Error reading AI instructions from Supabase:", error);
    return NextResponse.json({ rules: [] }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    if (!data || !Array.isArray(data.rules)) {
      return NextResponse.json({ success: false, error: "Invalid data format" }, { status: 400 });
    }

    // 1. Delete all existing rules to sync the overwrite
    const { error: deleteError } = await supabase
      .from('ai_rules')
      .delete()
      .not('id', 'is', null);

    if (deleteError) throw deleteError;

    // 2. Insert new list if not empty
    if (data.rules.length > 0) {
      const mappedRules = data.rules.map(r => ({
        id: r.id ? r.id.toString() : Date.now().toString(),
        text: r.text,
        is_active: r.isActive !== undefined ? r.isActive : true
      }));

      const { error: insertError } = await supabase
        .from('ai_rules')
        .insert(mappedRules);

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error writing AI instructions to Supabase:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

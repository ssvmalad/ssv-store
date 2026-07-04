import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error("GET Deliveries API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const deliveryId = `DLV-${Math.floor(1000 + Math.random() * 9000)}`;

    const newDelivery = {
      id: deliveryId,
      order_id: body.order_id || '',
      customer_name: body.customer_name || '',
      customer_phone: body.customer_phone || '',
      customer_address: body.customer_address || '',
      status: body.status || 'pending',
      carrier: body.carrier || 'DTDC Express',
      tracking_number: body.tracking_number || ''
    };

    const { data, error } = await supabase
      .from('deliveries')
      .insert(newDelivery)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("POST Deliveries API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Delivery ID is required' }, { status: 400 });
    }

    const updateFields = {
      status: body.status,
      carrier: body.carrier,
      tracking_number: body.tracking_number,
      updated_at: new Date().toISOString()
    };

    // Remove undefined values
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] === undefined) delete updateFields[key];
    });

    const { data, error } = await supabase
      .from('deliveries')
      .update(updateFields)
      .eq('id', body.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("PUT Deliveries API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('deliveries')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Deliveries API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

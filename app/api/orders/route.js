import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const phone = searchParams.get('phone');
    const email = searchParams.get('email');
    
    // Cookie-based check for Admin token
    const adminToken = request.cookies.get('admin_token')?.value;
    const isAdmin = adminToken === 'authenticated';

    if (id) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (data) return NextResponse.json(data);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (phone || email) {
      let query = supabase.from('orders').select('*');
      if (phone && email) {
        query = query.or(`customer_phone.eq.${phone},customer_email.eq.${email}`);
      } else if (phone) {
        query = query.eq('customer_phone', phone);
      } else {
        query = query.eq('customer_email', email);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json(data || []);
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error("GET Orders API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const orderId = `SSV-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: orderId,
      customer_name: body.customer_name || 'Walk-in Customer',
      customer_phone: body.customer_phone || '',
      customer_email: body.customer_email || '',
      customer_address: body.customer_address || '',
      items: body.items || [],
      total_price: body.total_price || 0,
      status: body.status || 'pending',
      payment_method: body.payment_method || 'whatsapp',
      payment_status: body.payment_status || 'pending',
      payment_ref: body.payment_ref || '',
      special_instructions: body.special_instructions || '',
      special_files: body.special_files || []
    };

    const { data, error } = await supabase
      .from('orders')
      .insert(newOrder)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("POST Orders API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const updateFields = {
      status: body.status,
      customer_name: body.customer_name,
      customer_phone: body.customer_phone,
      customer_address: body.customer_address,
      items: body.items,
      total_price: body.total_price,
      payment_method: body.payment_method,
      payment_status: body.payment_status,
      payment_ref: body.payment_ref,
      special_instructions: body.special_instructions,
      special_files: body.special_files
    };

    // Remove undefined values
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] === undefined) delete updateFields[key];
    });

    const { data, error } = await supabase
      .from('orders')
      .update(updateFields)
      .eq('id', body.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    console.error("PUT Orders API Error:", error);
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
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Orders API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

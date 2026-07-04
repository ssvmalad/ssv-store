import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD || 'ssv-admin';
    
    if (password === adminPassword) {
      const response = NextResponse.json({ success: true });
      // Set the authentication cookie
      response.cookies.set('admin_token', 'authenticated', {
        path: '/',
        maxAge: 86400, // 24 hours
        httpOnly: false, // Keep false because client-side layout.js reads document.cookie
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      return response;
    } else {
      return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

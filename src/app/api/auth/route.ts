import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Authentication failed' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Set cookies server-side
    const cookieStore = await cookies();
    cookieStore.set('accessToken', JSON.stringify(data.accessToken), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    cookieStore.set('refreshToken', JSON.stringify(data.refreshToken), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const cookieStore = cookies();
  (await cookieStore).delete('accessToken');
  (await cookieStore).delete('refreshToken');

  return NextResponse.json({ success: true });
}

export async function GET() {
  const cookieStore = cookies();
  const token = (await cookieStore).get('accessToken');

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const tokenValue = JSON.parse(token.value);
    console.log("tokenValue: ", tokenValue);

    return NextResponse.json({ authenticated: true });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
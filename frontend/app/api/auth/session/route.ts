import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');

    if (!session) {
      return NextResponse.json({ user: null });
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/auth/session`, {
      headers: {
        Authorization: `Bearer ${session.value}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ user: null });
  }
} 
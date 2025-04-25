import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');

    if (session) {
      // Clear the session cookie
      const response = NextResponse.json({ message: 'Logged out successfully' });
      response.cookies.set('session', '', {
        expires: new Date(0),
        path: '/',
      });
      return response;
    }

    return NextResponse.json({ message: 'No active session' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
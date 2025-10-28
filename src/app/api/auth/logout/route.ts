import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Clear the auth token cookie
    cookies().delete('auth_token');
    
    return new NextResponse(JSON.stringify({
      success: true,
      message: 'Logged out successfully',
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': 'auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax',
      },
    });
  } catch (error) {
    console.error('Logout error:', error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Failed to log out',
      }),
      { status: 500 }
    );
  }
}

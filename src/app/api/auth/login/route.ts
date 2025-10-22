import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import { z } from 'zod';
import pool from '@/lib/db';
import { compare } from 'bcryptjs';
import mysql from 'mysql2/promise';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Find user in database
    const [rows] = await pool.query<mysql.RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    const user = rows[0];

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token (if you want to use JWT)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const token = await new SignJWT({ 
      userId: user.id, 
      email: user.email,
      username: user.username 
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

    // Set HTTP-only cookie
    cookies().set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Return user data (without sensitive information)
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      // Add other non-sensitive user data as needed
    };

    return NextResponse.json(
      { 
        success: true, 
        message: 'Login successful',
        user: userData,
        token: token // Only include token if you're not using httpOnly cookies
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Validation error', 
          errors: error.issues.map((issue: { message: string }) => issue.message)
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { 
        success: false,
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

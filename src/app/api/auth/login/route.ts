import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import { z } from 'zod';
import pool from '@/lib/db';
import { compare } from 'bcryptjs';
import mysql from 'mysql2/promise';

// Enable SQL logging in development
const debug = process.env.NODE_ENV !== 'production';

// Helper function to log SQL queries with error handling
const queryWithLog = async (sql: string, params: any[] = []) => {
  if (debug) {
    console.log('Executing query:', mysql.format(sql, params));
  }
  try {
    const result = await pool.query(sql, params);
    return result;
  } catch (error: any) {
    const errorInfo = {
      message: error.message,
      code: error.code,
      sql: mysql.format(sql, params),
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    };
    console.error('Database query error:', errorInfo);
    throw error;
  }
};

// Input validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Helper function to create error response
const errorResponse = (message: string, status: number = 400, details?: any) => {
  const response = {
    success: false,
    message,
    ...(debug && details && { details })
  };
  return new NextResponse(JSON.stringify(response), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
};

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return errorResponse('Invalid JSON payload', 400);
    }

    // Validate input
    let validatedData;
    try {
      validatedData = loginSchema.parse(body);
    } catch (error) {
      return errorResponse(
        'Validation failed',
        400,
        error.errors?.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      );
    }

    const { email, password } = validatedData;

    // Find user in database by email
    const [rows] = await queryWithLog(
      `SELECT 
        id, 
        username, 
        email, 
        password, 
        status, 
        is_verified, 
        firstname,
        lastname,
        created_at 
      FROM users 
      WHERE email = ?`,
      [email]
    ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

    const user = rows[0];
    
    // Debug logging
    if (debug) {
      console.log('Login attempt for email:', email);
      console.log('User found:', user ? 'Yes' : 'No');
      if (user) {
        console.log('User data:', {
          id: user.id,
          email: user.email,
          status: user.status,
          hasPassword: !!user.password
        });
      }
    }

    // Check if user exists
    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Check if account is active
    if (user.status !== 1) {
      return errorResponse(
        'Your account is not active. Please contact support.',
        403
      );
    }

    // Verify password
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 401);
    }

    try {
      // Create JWT token
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'your-secret-key'
      );
      
      const token = await new SignJWT({ 
        userId: user.id, 
        email: user.email,
        username: user.username,
        name: user.firstname || user.username
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

      // Return user data with token
      const userData = {
        id: user.id,
        username: user.username,
        email: user.email,
        isVerified: user.is_verified === 1,
        createdAt: user.created_at,
      };

      return new NextResponse(JSON.stringify({
        success: true,
        message: 'Login successful',
        token: token, // Include the JWT token in the response body
        user: userData
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          // Also set the token as a cookie for httpOnly access
          'Set-Cookie': `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''} Max-Age=604800`
        }
      });

    } catch (error) {
      console.error('Token generation error:', error);
      return errorResponse('Failed to generate authentication token', 500);
    }

  } catch (error: any) {
    console.error('Login error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      ...(error.sqlState && { sqlState: error.sqlState })
    });
    
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
    
    // Handle specific MySQL errors
    let errorMessage = 'An error occurred during login';
    if (error.code === 'ER_NO_SUCH_TABLE') {
      errorMessage = 'Database table does not exist. Please check your database setup.';
    }
    
    return NextResponse.json(
      { 
        success: false,
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { 
          error: error.message,
          code: error.code 
        })
      },
      { status: 500 }
    );
  }
}

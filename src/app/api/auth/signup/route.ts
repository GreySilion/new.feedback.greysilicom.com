import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import pool from '@/lib/db';

// Enable SQL logging in development
const debug = process.env.NODE_ENV !== 'production';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type UserRow = {
  id: number;
  username: string | null;
  email: string | null;
  email_verified: Date | null;
  image: string | null;
  password: string | null;
  mobile: string | null;
  role: 'ADMIN' | 'USER';
  is_two_factor_enabled: boolean;
  two_factor_confirmed_at: Date | null;
  is_oauth: boolean;
  password_reset_token: string | null;
  password_reset_expires: Date | null;
  verification_token: string | null;
  verification_token_expires: Date | null;
  is_verified: boolean;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
};

type ResultSet = [mysql.RowDataPacket[] | mysql.RowDataPacket[][] | mysql.ResultSetHeader, mysql.FieldPacket[]];

// Type for SQL query parameters
type QueryParams = (string | number | boolean | null | Date)[];

// Helper function to log SQL queries in development
const queryWithLog = async (sql: string, params: QueryParams = []) => {
  if (debug) {
    console.log('Executing query:', mysql.format(sql, params));
  }
  try {
    const result = await pool.query(sql, params);
    return result;
  } catch (error: unknown) {
    const err = error as Error & {
      code?: string;
      sqlMessage?: string;
      sqlState?: string;
    };
    const errorInfo = {
      message: err.message,
      code: err.code,
      sql: mysql.format(sql, params),
      sqlMessage: err.sqlMessage,
      sqlState: err.sqlState
    };
    console.error('Database query error:', errorInfo);
    throw new Error(err.message);
  }
};

export async function POST(request: Request) {
  console.log('🔵 Signup request received');
  
  try {
    const requestBody = await request.json();
    console.log('🔵 Request body:', JSON.stringify(requestBody, null, 2));
    
    const { username, email, mobile, password } = requestBody;
    
    // Log database connection details for debugging
    console.log('🔵 Database connection details:', {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      hasPassword: !!password,
      env: process.env.NODE_ENV
    });

    // Input validation
    if (!email || !password || !username) {
      return NextResponse.json(
        { message: 'Email, username, and password are required' },
        { status: 400 }
      );
    }

    // Check if user with the same email already exists
    console.log('🔵 Checking for existing user with email:', email);
    let emailRows;
    try {
      [emailRows] = await queryWithLog(
        'SELECT id FROM users WHERE email = ?',
        [email]
      ) as ResultSet;
      console.log('🔵 Existing email check result:', emailRows);
    } catch (queryError) {
      console.error('❌ Error checking for existing email:', queryError);
      throw new Error(`Failed to check for existing user: ${queryError.message}`);
    }

    const existingEmail = emailRows as mysql.RowDataPacket[];
    if (existingEmail?.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Email already in use' },
        { status: 400 }
      );
    }

    // Hash the password
    if (!password) {
      console.error('❌ Password is required');
      return NextResponse.json(
        { success: false, message: 'Password is required' },
        { status: 400 }
      );
    }
    
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
      console.log('🔵 Password hashed successfully');
    } catch (hashError) {
      console.error('❌ Error hashing password:', hashError);
      throw new Error('Failed to process password');
    }
    const currentDate = new Date();
    const currentTimestamp = currentDate.toISOString().slice(0, 19).replace('T', ' ');

    // Insert the new user into the database with required fields
    const [result] = await queryWithLog(
      `INSERT INTO users (
        username,
        email,
        password,
        mobile,
        is_verified,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        username,          // username
        email,            // email
        hashedPassword,   // password
        mobile || null,   // mobile
        false,            // is_verified
        currentTimestamp, // created_at
        currentTimestamp  // updated_at
      ]
    ) as ResultSet;

    const insertResult = result as mysql.ResultSetHeader;
    
    // Return success response with redirect URL and message
    return NextResponse.json(
      { 
        success: true,
        message: '🎉 Account created successfully!',
        description: 'You can now log in with your email and password.',
        userId: insertResult.insertId,
        redirect: '/auth/login',
        showToast: true,
        toastType: 'success'
      },
      { status: 201 }
    );

  } catch (error: unknown) {
    const err = error as Error & { code?: string };
    // Get request data from the outer scope
    const requestData = (() => {
      try {
        const body = request.body ? JSON.parse(JSON.stringify(request.body)) : {};
        const { username, email, mobile } = body as { 
          username?: string; 
          email?: string; 
          mobile?: string | null;
          password?: string;
        };
        return {
          username,
          email,
          hasPassword: 'password' in body,
          mobile
        };
      } catch (e) {
        return { error: 'Could not parse request data' };
      }
    })();
    
    // Log detailed error information
    const errorDetails = {
      message: err.message,
      code: err.code,
      name: err.name,
      stack: err.stack,
      requestData,
      isEmailError: err.code === 'ER_DUP_ENTRY' && err.message?.includes('email'),
      isUsernameError: err.code === 'ER_DUP_ENTRY' && err.message?.includes('username'),
      isMobileError: err.code === 'ER_DUP_ENTRY' && err.message?.includes('mobile'),
      isValidationError: err.name === 'ValidationError',
      isDatabaseError: err.code && typeof err.code === 'string' && err.code.startsWith('ER_'),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      os: process.platform,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    };

    console.error('Error creating user:', errorDetails);

    // Return appropriate error response
    if (err.code === 'ER_DUP_ENTRY') {
      if (err.message?.includes('email')) {
        return NextResponse.json(
          { success: false, message: 'Email already in use' },
          { status: 400 }
        );
      } else if (err.message?.includes('username')) {
        return NextResponse.json(
          { success: false, message: 'Username already taken' },
          { status: 400 }
        );
      } else if (err.message?.includes('mobile')) {
        return NextResponse.json(
          { success: false, message: 'Mobile number already in use' },
          { status: 400 }
        );
      }
    }

    // For other types of errors, return a generic error message
    const errorResponse = {
      success: false, 
      message: 'Failed to create user',
      ...(process.env.NODE_ENV === 'development' && {
        error: err.message,
        code: err.code,
        ...('sqlMessage' in err && { 
          sqlMessage: (err as { sqlMessage?: string }).sqlMessage 
        })
      })
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

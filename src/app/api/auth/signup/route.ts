import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import pool from '@/lib/db';

// Enable SQL logging in development
const debug = process.env.NODE_ENV !== 'production';

type UserRow = {
  id: number;
  username: string;
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  mobile: string | null;
  status: number;
  is_verified: number;
  created_at: Date;
  updated_at: Date;
};

type ResultSet = [mysql.RowDataPacket[] | mysql.RowDataPacket[][] | mysql.ResultSetHeader, mysql.FieldPacket[]];

// Helper function to log SQL queries in development
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

export async function POST(request: Request) {
  try {
    const { username, email, mobile, password } = await request.json();

    // Input validation
    if (!email || !password || !username) {
      return NextResponse.json(
        { message: 'Email, username, and password are required' },
        { status: 400 }
      );
    }

    // Check if user with the same email already exists
    const [emailRows] = await queryWithLog(
      'SELECT id FROM users WHERE email = ?',
      [email]
    ) as ResultSet;

    const existingEmail = emailRows as mysql.RowDataPacket[];
    if (existingEmail?.length > 0) {
      return NextResponse.json(
        { message: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Check if username is already taken
    const [usernameRows] = await queryWithLog(
      'SELECT id FROM users WHERE username = ?',
      [username]
    ) as ResultSet;

    const existingUsername = usernameRows as mysql.RowDataPacket[];
    if (existingUsername?.length > 0) {
      return NextResponse.json(
        { message: 'This username is already taken' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const currentDate = new Date();
    const currentTimestamp = currentDate.toISOString().slice(0, 19).replace('T', ' ');

    // Insert the new user into the database with required fields
    const [result] = await queryWithLog(
      `INSERT INTO users (
        username,
        email,
        password,
        firstname,
        lastname,
        mobile,
        is_verified,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        username,          // username
        email,             // email
        hashedPassword,    // password
        username,          // firstname (using username as firstname)
        username,          // lastname (using username as lastname)
        mobile || null,    // mobile (can be null)
        0,                 // is_verified (0 = false)
        1,                 // status (1 = active)
        currentTimestamp,  // created_at
        currentTimestamp   // updated_at
      ]
    ) as ResultSet;

    const insertResult = result as mysql.ResultSetHeader;
    
    // Return success response without sensitive data
    return NextResponse.json(
      { 
        success: true,
        message: 'User created successfully',
        userId: insertResult.insertId 
      },
      { status: 201 }
    );

  } catch (error: any) {
    // Get request data from the outer scope
    const requestData = (() => {
      try {
        const { username, email, mobile } = request.body ? 
          JSON.parse(JSON.stringify(request.body)) : {};
        return {
          username,
          email,
          hasPassword: !!(request.body && 'password' in request.body),
          mobile
        };
      } catch (e) {
        return { error: 'Could not parse request data' };
      }
    })();
    
    // Log detailed error information
    const errorDetails = {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sql: error.sql,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState,
      stack: error.stack,
      requestData
    };
    
    console.error('🔴 Signup Error:', JSON.stringify(errorDetails, null, 2));
    
    // Handle specific MySQL errors
    let errorMessage = 'An error occurred during signup';
    let statusCode = 500;
    
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.sqlMessage?.includes('users_email_unique')) {
        errorMessage = 'A user with this email already exists';
      } else if (error.sqlMessage?.includes('users_username_unique')) {
        errorMessage = 'This username is already taken';
      } else {
        errorMessage = 'This email or username is already registered';
      }
      statusCode = 400;
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      errorMessage = 'Database configuration error. Please contact support.';
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      errorMessage = 'Database access denied. Please check your database credentials.';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Could not connect to the database. Please try again later.';
    }
    
    // Prepare response with appropriate error details
    const response = {
      success: false,
      message: errorMessage,
      // Only include detailed error info in development
      ...(process.env.NODE_ENV === 'development' ? {
        error: error.message,
        code: error.code,
        ...(error.sqlMessage && { sqlMessage: error.sqlMessage })
      } : {})
    };
    
    return new NextResponse(JSON.stringify(response), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

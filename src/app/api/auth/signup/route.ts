import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import pool from '@/lib/db';

type UserRow = {
  id: number;
  // Add other user fields as needed
};

type ResultSet = [mysql.RowDataPacket[] | mysql.RowDataPacket[][] | mysql.ResultSetHeader, mysql.FieldPacket[]];

export async function POST(request: Request) {
  try {
    const { username, email, mobile, password } = await request.json();

    // Check if user with the same email already exists
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    ) as ResultSet;

    const existingUsers = rows as mysql.RowDataPacket[];
    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { message: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const [result] = await pool.query(
      `INSERT INTO users (username, email, mobile, password, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [username, email, mobile, hashedPassword]
    ) as ResultSet;

    const insertResult = result as mysql.ResultSetHeader;
    
    // Return success response without sensitive data
    return NextResponse.json(
      { 
        message: 'User created successfully',
        userId: insertResult.insertId 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}

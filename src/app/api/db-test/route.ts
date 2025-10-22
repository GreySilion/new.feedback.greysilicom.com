import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    const connection = await pool.getConnection();
    
    try {
      // Check if users table exists
      const [tables] = await connection.query(
        "SHOW TABLES LIKE 'users'"
      ) as [mysql.RowDataPacket[], mysql.FieldPacket[]];
      
      if (tables.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Users table does not exist',
            tables: await connection.query('SHOW TABLES')
          },
          { status: 404 }
        );
      }
      
      // Get table structure
      const [columns] = await connection.query('DESCRIBE users');
      
      return NextResponse.json({
        success: true,
        tableExists: true,
        tableStructure: columns
      });
      
    } finally {
      connection.release();
    }
    
  } catch (error: any) {
    console.error('Database test error:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Database connection failed',
        error: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          code: error.code,
          sqlMessage: error.sqlMessage
        } : undefined
      },
      { status: 500 }
    );
  }
}

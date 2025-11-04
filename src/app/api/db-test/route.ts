import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { PoolConnection, RowDataPacket, FieldPacket } from 'mysql2/promise';

interface DatabaseError extends Error {
  code?: string;
  sqlMessage?: string;
  sqlState?: string;
  errno?: number;
  sql?: string;
}

export async function GET() {
  try {
    const connection = await pool.getConnection();
    
    try {
      // Check if users table exists with proper typing
      const [tables] = await connection.query<RowDataPacket[]>(
        "SHOW TABLES LIKE 'users'"
      ) as [RowDataPacket[], FieldPacket[]];
      
      if (tables.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Users table does not exist',
            tables: await connection.query<RowDataPacket[]>('SHOW TABLES')
          },
          { status: 404 }
        );
      }
      
      // Get table structure with proper typing
      const [columns] = await connection.query<RowDataPacket[]>('DESCRIBE users');
      
      return NextResponse.json({
        success: true,
        tableExists: true,
        tableStructure: columns
      });
      
    } finally {
      connection.release();
    }
    
  } catch (error: unknown) {
    const dbError = error as DatabaseError;
    
    console.error('Database test error:', {
      message: dbError.message,
      code: dbError.code,
      sqlMessage: dbError.sqlMessage,
      sqlState: dbError.sqlState,
      ...(process.env.NODE_ENV === 'development' && { stack: dbError.stack })
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Database connection failed',
        ...(process.env.NODE_ENV === 'development' && {
          error: {
            message: dbError.message,
            code: dbError.code,
            sqlMessage: dbError.sqlMessage,
            ...(dbError.sql && { sql: dbError.sql })
          }
        })
      },
      { status: 500 }
    );
  }
}

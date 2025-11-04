import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { RowDataPacket, FieldPacket, ResultSetHeader } from 'mysql2/promise';

interface QueryResult extends RowDataPacket {
  result?: number;
  TABLE_NAME?: string;
}

interface TestResult extends RowDataPacket {
  success: boolean;
  connectionTest: string;
  database: string;
  feedbackTableExists: boolean;
  queryTest?: number;
  error?: string;
  details?: unknown;
}

interface DatabaseError extends Error {
  code?: string | number;
  errno?: number;
  sqlState?: string;
  sqlMessage?: string;
  sql?: string;
}

export async function GET() {
  try {
    // Test database connection
    const connection = await pool.getConnection();
    
    try {
      // Test a simple query
      const [rows] = await connection.query<QueryResult[]>('SELECT 1 + 1 AS result');
      
      // Test if the feedback table exists
      const [tables] = await connection.query<QueryResult[]>(
        `SELECT TABLE_NAME 
         FROM INFORMATION_SCHEMA.TABLES 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'feedback'`,
        [process.env.DB_NAME || 'new_greysilicon_feedback']
      ) as [QueryResult[], FieldPacket[]];
      
      // Check if the feedback table exists
      const feedbackTableExists = Array.isArray(tables) && tables.length > 0;
      
      const result = {
        success: true,
        connectionTest: 'OK',
        database: process.env.DB_NAME || 'new_greysilicon_feedback',
        feedbackTableExists,
        simpleQueryResult: rows[0]?.result,
        timestamp: new Date().toISOString()
      };
      
      console.log('Database test successful:', result);
      return NextResponse.json(result);
    } finally {
      connection.release();
    }
  } catch (error: unknown) {
    console.error('Database test failed:', error);
    const errorResponse: Partial<DatabaseError> = {};
    
    if (error && typeof error === 'object') {
      const dbError = error as DatabaseError;
      errorResponse.message = dbError.message || 'Database connection failed';
      errorResponse.code = dbError.code;
      errorResponse.sqlState = dbError.sqlState;
      errorResponse.sqlMessage = dbError.sqlMessage;
      
      if (process.env.NODE_ENV === 'development') {
        errorResponse.sql = dbError.sql;
      }
    }
    
    console.error('Error response:', errorResponse);
    return NextResponse.json(
      { 
        success: false,
        error: 'Database test failed',
        details: process.env.NODE_ENV === 'development' ? errorResponse : undefined
      },
      { status: 500 }
    );
  }
}

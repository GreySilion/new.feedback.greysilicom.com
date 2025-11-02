import { NextResponse } from 'next/server';
import pool from '@/lib/db';

interface QueryResult extends Array<any> {
  [key: string]: any;
  result?: number;
}

interface DatabaseError extends Error {
  code?: string | number;
  errno?: number;
  sqlState?: string;
  sqlMessage?: string;
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
      ) as [QueryResult[], any];
      
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
  } catch (err) {
    const error = err as DatabaseError;
    console.error('Database connection test failed:', error);
    
    const errorResponse = {
      success: false,
      error: 'Database connection failed',
      message: error.message || 'Unknown error',
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      })
    };
    
    console.error('Error response:', errorResponse);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

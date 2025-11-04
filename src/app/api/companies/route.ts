import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/config';
import pool from '@/lib/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

interface Company extends RowDataPacket {
  id: number;
  name: string;
  owner_id: number;
  status: number; // tinyint in DB
  description: string | null;
  created_at: string | Date;
  updated_at: string | Date;
  review_count: number;
  feedback_count: number;
  feedback_sent: number;
  // MPESA fields
  MPESA_SHORTCODE?: string | null;
  MPESA_STORE_NUMBER?: string | null;
  MPESA_PASSKEY?: string | null;
  MPESA_CONSUMER_KEY?: string | null;
  MPESA_CONSUMER_SECRET?: string | null;
  MPESA_SECURITY_CREDS?: string | null;
  sms_sender_id?: string | null;
  feedback_message?: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function GET(_request: Request): Promise<NextResponse<ApiResponse<Company[]>>> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // Query companies for the current user with proper typing
    const [rows] = await pool.query<Company[]>(
      `SELECT 
        id, 
        name,
        owner_id,
        status,
        description,
        created_at,
        updated_at,
        review_count,
        feedback_count,
        feedback_sent
      FROM 
        companies 
      WHERE 
        owner_id = ? 
      ORDER BY 
        name ASC`,
      [userId]
    );
    
    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('Error in GET /api/companies:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch companies',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

interface CreateCompanyRequest {
  name: string;
  description?: string;
  status?: number;
  feedback_message?: string;
  sms_sender_id?: string;
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<Company>>> {
  let connection;
  
  try {
    // Get the authenticated user from session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let body: CreateCompanyRequest;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const { name, description, status = 1, feedback_message = '', sms_sender_id = '' } = body;

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Company name is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Get database connection
    connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert new company with proper typing
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO companies 
          (name, description, owner_id, status, feedback_message, sms_sender_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          name.trim(), 
          description?.trim() || null, 
          session.user.id,
          status,
          feedback_message,
          sms_sender_id
        ]
      );

      const companyId = result.insertId;
      if (!companyId) {
        throw new Error('Failed to create company');
      }

      // Get the newly created company with proper typing
      const [companyRows] = await connection.query<Company[]>(
        `SELECT id, name, status, created_at 
         FROM companies 
         WHERE id = ?`,
        [companyId]
      );
      
      const company = companyRows[0];
      if (!company) {
        throw new Error('Failed to retrieve created company');
      }

      await connection.commit();

      return NextResponse.json({
        success: true,
        data: company,
      }, { status: 201 });
    } catch (error) {
      await connection.rollback();
      throw error; // Let the outer catch handle it
    }
  } catch (error) {
    console.error('Error in POST /api/companies:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create company' 
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/config';
import pool from '@/lib/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

interface Company extends RowDataPacket {
  id: number;
  owner_id: number;
  category_id?: number | null;
  name: string;
  image?: string | null;
  domain?: string | null;
  address?: string | null;
  country?: string | null;
  zip?: number | null;
  email?: string | null;
  mobile?: string | null;
  avg_rating?: number | null;
  review_count: number;
  description: string | null;
  company_status: number;
  MPESA_SHORTCODE?: string | null;
  MPESA_STORE_NUMBER?: string | null;
  MPESA_PASSKEY?: string | null;
  MPESA_CONSUMER_KEY?: string | null;
  MPESA_CONSUMER_SECRET?: string | null;
  MPESA_SECURITY_CREDS?: string | null;
  reason?: string | null;
  created_at: string | Date;
  updated_at: string | Date;
  feedback_count: number;
  feedback_sent: number;
  sms_sender_id?: string | null;
  feedback_message?: string | null;
  status: 'PENDING' | 'PUBLISHED' | 'REJECTED';
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
        owner_id,
        category_id,
        name,
        image,
        domain,
        address,
        country,
        zip,
        email,
        mobile,
        avg_rating,
        review_count,
        description,
        company_status,
        MPESA_SHORTCODE,
        MPESA_STORE_NUMBER,
        MPESA_PASSKEY,
        MPESA_CONSUMER_KEY,
        MPESA_CONSUMER_SECRET,
        MPESA_SECURITY_CREDS,
        reason,
        created_at,
        updated_at,
        feedback_count,
        feedback_sent,
        sms_sender_id,
        feedback_message,
        status
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
  
  console.log('1. Starting POST /api/companies');
  
  try {
    // Get the authenticated user from session
    console.log('2. Getting server session');
    const session = await getServerSession(authOptions);
    console.log('3. Session data:', session);
    
    if (!session?.user?.id) {
      console.error('4. No user ID in session');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    console.log('4. Parsing request body');
    let body: CreateCompanyRequest;
    try {
      const requestClone = request.clone();
      const bodyText = await request.text();
      console.log('5. Raw request body:', bodyText);
      
      body = JSON.parse(bodyText);
      console.log('6. Parsed request body:', body);
    } catch (e) {
      console.error('7. Error parsing request body:', e);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid JSON payload',
          details: e instanceof Error ? e.message : 'Unknown error'
        },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { name, description } = body;
    console.log('8. Extracted fields:', { name, description });

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      console.error('9. Invalid company name');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Company name is required and cannot be empty',
          receivedName: name
        },
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get database connection
    console.log('10. Getting database connection');
    try {
      connection = await pool.getConnection();
      console.log('11. Database connection established');
      await connection.beginTransaction();
      console.log('12. Transaction started');
    } catch (dbError) {
      console.error('13. Database connection error:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection failed',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error'
        },
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    try {
      // First, verify the user exists and get their details
      console.log('13. Checking if user exists in database');
      const [userRows] = await connection.query<RowDataPacket[]>(
        'SELECT id, role FROM users WHERE id = ?',
        [session.user.id]
      );

      if (userRows.length === 0) {
        console.error('14. User not found in database');
        throw new Error(`User with ID ${session.user.id} not found in database`);
      }

      const user = userRows[0];
      console.log('15. Found user:', { userId: user.id, role: user.role });
      
      const companyData = {
        name: name.trim(),
        owner_id: user.id,
        status: 'PUBLISHED',
        company_status: 1,
        description: description?.trim() || '',
        feedback_message: 'Thank you for your feedback!',
        sms_sender_id: 'FEEDBACK',
        created_at: new Date(),
        updated_at: new Date(),
        review_count: 0,
        feedback_count: 0,
        feedback_sent: 0
      };
      
      console.log('16. Prepared company data:', JSON.stringify(companyData, null, 2));

      // Insert new company with the user as owner
      console.log('17. Starting company creation query');
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO companies SET ?`,
        [companyData]
      );

      const companyId = result.insertId;
      console.log('18. Company created with ID:', companyId);
      
      if (!companyId) {
        const errorMsg = 'Failed to get insert ID from result';
        console.error('19. ' + errorMsg + ':', result);
        throw new Error(errorMsg);
      }
      
      console.log('Company created successfully with ID:', companyId);
      
      // If this is the user's first company, update their role to ADMIN
      // since the database only supports 'ADMIN' or 'USER' roles
      if (user.role === 'USER') {
        console.log('19. Updating user role to ADMIN for user ID:', user.id);
        try {
          await connection.query<ResultSetHeader>(
            'UPDATE users SET role = ? WHERE id = ?',
            ['ADMIN', user.id]
          );
          console.log('20. Successfully updated user role');
        } catch (updateError) {
          console.error('20. Error updating user role:', updateError);
          // Continue with the transaction even if role update fails
        }
      }
      
      // Get the newly created company with all fields
      const [companyRows] = await connection.query<Company[]>(
        `SELECT * FROM companies WHERE id = ?`,
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
        message: 'Company created successfully'
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

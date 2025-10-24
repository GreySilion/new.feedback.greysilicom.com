import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// POST /api/feedback - Submit new feedback
export async function POST(request) {
  try {
    const { name, email, subject, message, company_id, rating } = await request.json();

    if (!name || !email || !message || !company_id) {
      return NextResponse.json(
        { error: 'Name, email, message, and company_id are required' },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      'INSERT INTO feedback (name, email, subject, message, company_id, rating, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [name, email, subject || '', message, company_id, rating || null, 'pending']
    );

    return NextResponse.json(
      { message: 'Feedback submitted successfully', id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback', details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/feedback - Get all feedback (for admin)
export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT f.*, c.name as company_name 
      FROM feedback f 
      LEFT JOIN companies c ON f.company_id = c.id 
      ORDER BY f.created_at DESC
    `);
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback', details: error.message },
      { status: 500 }
    );
  }
}

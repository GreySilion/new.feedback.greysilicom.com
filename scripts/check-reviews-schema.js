const mysql = require('mysql2/promise');

async function checkReviewsSchema() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'S3cr3t_3',
    database: 'new_greysilicon_feedback',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('Connecting to database...');
    
    // 1. Check table structure
    console.log('\n=== Reviews Table Structure ===');
    const [columns] = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default, column_comment 
      FROM information_schema.columns 
      WHERE table_name = 'reviews' 
      ORDER BY ordinal_position
    `);
    
    console.table(columns);
    
    // 2. Get sample data
    console.log('\n=== Sample Reviews Data ===');
    const [reviews] = await pool.query(`
      SELECT 
        r.id, 
        r.company_id,
        r.name as customer_name,
        r.review as comment,
        r.rating,
        r.status,
        r.created_at,
        r.updated_at,
        r.title,
        r.email,
        r.phone,
        c.name as company_name
      FROM reviews r
      LEFT JOIN companies c ON r.company_id = c.id
      WHERE r.company_id = 19
      ORDER BY r.created_at DESC
      LIMIT 5
    `);
    
    console.log('\nSample reviews for company_id 19:');
    console.table(reviews);
    
    // 3. Check for any data issues
    console.log('\n=== Data Quality Check ===');
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_reviews,
        COUNT(DISTINCT company_id) as companies_with_reviews,
        SUM(CASE WHEN r.name IS NULL OR r.name = '' THEN 1 ELSE 0 END) as missing_names,
        SUM(CASE WHEN r.review IS NULL OR r.review = '' THEN 1 ELSE 0 END) as missing_reviews,
        SUM(CASE WHEN r.rating IS NULL THEN 1 ELSE 0 END) as missing_ratings,
        MIN(r.created_at) as oldest_review,
        MAX(r.created_at) as newest_review,
        COUNT(CASE WHEN r.status = 'pending' THEN 1 END) as pending_reviews,
        COUNT(CASE WHEN r.status = 'replied' THEN 1 END) as replied_reviews
      FROM reviews r
      WHERE r.company_id = 19
    `);
    
    console.table(stats);
    
  } catch (error) {
    console.error('Error checking reviews schema:', error);
  } finally {
    await pool.end();
  }
}

checkReviewsSchema();

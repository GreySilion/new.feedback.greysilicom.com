const mysql = require('mysql2/promise');

async function getCompanyReviews(companyId) {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'S3cr3t_3',
    database: 'new_greysilicon_feedback',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  
  console.log('Connecting to database...');

  try {
    // Get all reviews for the company
    const [reviews] = await pool.query(
      `SELECT r.*, c.name as company_name 
       FROM reviews r
       LEFT JOIN companies c ON r.company_id = c.id
       WHERE r.company_id = ?
       ORDER BY r.created_at DESC`,
      [companyId]
    );

    console.log(`\nFound ${reviews.length} reviews for company ID ${companyId}:\n`);
    
    if (reviews.length === 0) {
      console.log('No reviews found for this company.');
      return;
    }

    // Display each review with its details
    reviews.forEach((review, index) => {
      console.log(`Review #${index + 1}:`);
      console.log(`- ID: ${review.id}`);
      console.log(`- Title: ${review.title || 'No title'}`);
      console.log(`- Rating: ${review.rating || 'N/A'}`);
      console.log(`- Customer: ${review.customer_name || 'Anonymous'}`);
      console.log(`- Comment: ${review.comment || 'No comment'}`);
      console.log(`- Status: ${review.status || 'unknown'}`);
      if (review.reply) {
        console.log(`- Reply: ${review.reply}`);
        console.log(`- Replied at: ${review.replied_at || 'N/A'}`);
      }
      console.log(`- Created at: ${review.created_at}`);
      console.log('----------------------------------------');
    });

    // Show summary
    const [stats] = await pool.query(
      `SELECT 
         COUNT(*) as total_reviews,
         AVG(rating) as avg_rating,
         SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replied_count
       FROM reviews 
       WHERE company_id = ?`,
      [companyId]
    );

    console.log('\nSummary:');
    console.log(`- Total Reviews: ${stats[0].total_reviews}`);
    console.log(`- Average Rating: ${Number(stats[0].avg_rating || 0).toFixed(1)}/5`);
    console.log(`- Replied: ${stats[0].replied_count}`);
    console.log(`- Pending: ${stats[0].total_reviews - stats[0].replied_count}`);

  } catch (error) {
    console.error('Error fetching reviews:', error);
  } finally {
    await pool.end();
  }
}

// Get company ID from command line argument or use default 19
const companyId = process.argv[2] || 19;
console.log(`Fetching reviews for company ID: ${companyId}`);
getCompanyReviews(companyId);

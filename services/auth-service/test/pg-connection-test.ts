import { Pool } from 'pg';

// Database connection configuration
const pool = new Pool({
  user: process.env.PGUSER || process.env.USER, // Try to get the current system user as a fallback
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'postgres', // Connect to default 'postgres' database first
  password: process.env.PGPASSWORD || '',
  port: parseInt(process.env.PGPORT || '5432', 10),
});

async function testConnection() {
  const client = await pool.connect();
  
  try {
    // Test the connection
    console.log('🔍 Testing database connection...');
    
    // Execute a simple query
    const result = await client.query('SELECT NOW() as now');
    console.log('✅ Database connection successful');
    console.log('📅 Current database time:', result.rows[0].now);
    
    // Test a query on the users table
    try {
      const usersResult = await client.query('SELECT * FROM users LIMIT 5');
      console.log(`📊 Found ${usersResult.rows.length} users in the database`);
      if (usersResult.rows.length > 0) {
        console.log('👥 Sample user:', {
          id: usersResult.rows[0].id,
          email: usersResult.rows[0].email,
          role: usersResult.rows[0].role
        });
      }
    } catch (error) {
      console.warn('⚠️ Could not query users table. It might not exist yet.');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the test
testConnection()
  .then(success => {
    console.log(success ? '✅ Test completed successfully' : '❌ Test failed');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });

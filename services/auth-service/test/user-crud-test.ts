import { Pool } from 'pg';

// Database connection configuration
const pool = new Pool({
  user: process.env.PGUSER || process.env.USER,
  host: process.env.PGHOST || 'localhost',
  database: 'auth_service_test',
  password: process.env.PGPASSWORD || '',
  port: parseInt(process.env.PGPORT || '5432', 10),
});

// Test user data
const testUser = {
  email: 'test@example.com',
  name: 'Test User',
  password: 'password123',
  role: 'USER'
};

async function testUserCRUD() {
  const client = await pool.connect();
  let userId: string | null = null;
  
  try {
    console.log('🚀 Starting user CRUD test...');
    
    // Test CREATE
    console.log('🔧 Creating test user...');
    const createResult = await client.query(
      'INSERT INTO users (email, name, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [testUser.email, testUser.name, testUser.password, testUser.role]
    );
    
    userId = createResult.rows[0].id;
    console.log(`✅ User created with ID: ${userId}`);
    
    // Test READ
    console.log('🔍 Reading user...');
    const readResult = await client.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    
    if (readResult.rows.length === 0) {
      throw new Error('User not found after creation');
    }
    
    const createdUser = readResult.rows[0];
    console.log('✅ User found:', {
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      role: createdUser.role
    });
    
    // Test UPDATE
    console.log('✏️ Updating user...');
    const newName = 'Updated Test User';
    await client.query(
      'UPDATE users SET name = $1 WHERE id = $2',
      [newName, userId]
    );
    
    const updatedResult = await client.query(
      'SELECT name FROM users WHERE id = $1',
      [userId]
    );
    
    if (updatedResult.rows[0].name !== newName) {
      throw new Error('User update failed');
    }
    
    console.log('✅ User updated successfully');
    
    // Test DELETE
    console.log('🗑️ Deleting user...');
    await client.query('DELETE FROM users WHERE id = $1', [userId]);
    
    const deleteCheck = await client.query(
      'SELECT 1 FROM users WHERE id = $1',
      [userId]
    );
    
    if (deleteCheck.rows.length > 0) {
      throw new Error('User deletion failed');
    }
    
    console.log('✅ User deleted successfully');
    
    return true;
  } catch (error) {
    console.error('❌ CRUD test failed:', error);
    return false;
  } finally {
    // Clean up in case of failure
    if (userId) {
      try {
        await client.query('DELETE FROM users WHERE id = $1', [userId]);
      } catch (e) {
        console.error('Error during cleanup:', e);
      }
    }
    client.release();
    await pool.end();
  }
}

// Run the test
testUserCRUD()
  .then(success => {
    console.log(success ? '✅ All tests passed!' : '❌ Some tests failed');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });

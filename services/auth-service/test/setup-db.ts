import { Pool } from 'pg';

// Database connection configuration
const config = {
  user: process.env.PGUSER || process.env.USER,
  host: process.env.PGHOST || 'localhost',
  database: 'postgres', // Connect to default database first
  password: process.env.PGPASSWORD || '',
  port: parseInt(process.env.PGPORT || '5432', 10),
};

async function createDatabase() {
  const pool = new Pool(config);
  const client = await pool.connect();
  
  try {
    // Check if database exists
    const dbExists = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      ['auth_service_test']
    );
    
    if (dbExists.rows.length === 0) {
      console.log('Creating database...');
      await client.query('CREATE DATABASE auth_service_test');
      console.log('✅ Database created');
    } else {
      console.log('ℹ️ Database already exists');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error creating database:', error);
    return false;
  } finally {
    client.release();
    await pool.end();
  }
}

async function createTables() {
  // Connect to the new database
  const pool = new Pool({
    ...config,
    database: 'auth_service_test'
  });
  
  const client = await pool.connect();
  
  try {
    console.log('Creating tables...');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        name TEXT,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'USER',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "lastLogin" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "refreshToken" TEXT NOT NULL UNIQUE,
        "userAgent" TEXT,
        "ipAddress" TEXT,
        "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create api_keys table
    await client.query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        key TEXT NOT NULL UNIQUE,
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "expiresAt" TIMESTAMP WITH TIME ZONE,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions("userId")');
    await client.query('CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys("userId")');
    
    console.log('✅ Tables created successfully');
    return true;
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    return false;
  } finally {
    client.release();
    await pool.end();
  }
}

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');
    
    // First create the database
    const dbCreated = await createDatabase();
    if (!dbCreated) return false;
    
    // Then create the tables
    const tablesCreated = await createTables();
    if (!tablesCreated) return false;
    
    console.log('✅ Database setup completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return false;
  }
}

// Run the setup
setupDatabase()
  .then(success => {
    console.log(success ? '✅ Setup completed successfully' : '❌ Setup failed');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });

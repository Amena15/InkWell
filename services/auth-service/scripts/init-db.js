const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function setupDatabase() {
  try {
    console.log('Creating database and schema...');
    
    // Create the database if it doesn't exist
    execSync('psql -U postgres -c "CREATE DATABASE inkwell;" || true', { stdio: 'inherit' });
    
    // Create the auth schema
    execSync('psql -U postgres -d inkwell -c "CREATE SCHEMA IF NOT EXISTS auth;"', { stdio: 'inherit' });
    
    console.log('Running migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();

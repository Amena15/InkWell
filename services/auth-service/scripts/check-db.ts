import { PrismaClient } from '../prisma/generated/client';

async function checkDatabase() {
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');
    
    // Try a simple query
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users in the database`);
    
  } catch (error) {
    console.error('❌ Error connecting to the database:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase().catch(console.error);

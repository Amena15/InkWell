import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.user.deleteMany({});

  // Hash passwords
  const hashedPassword = await bcrypt.hash('password123', 10);
  const adminHashedPassword = await bcrypt.hash('admin123', 10);

  // Create test users
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      emailVerified: new Date(),
      role: 'USER',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminHashedPassword,
      name: 'Admin User',
      emailVerified: new Date(),
      role: 'ADMIN',
    },
  });

  const unverifiedUser = await prisma.user.create({
    data: {
      email: 'unverified@example.com',
      password: hashedPassword,
      name: 'Unverified User',
      emailVerified: null, // This user needs email verification
      role: 'USER',
    },
  });

  console.log('Created test users:');
  console.log('- Test User (test@example.com / password123)');
  console.log('- Admin User (admin@example.com / admin123)');
  console.log('- Unverified User (unverified@example.com / password123) - Needs email verification');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

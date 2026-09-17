import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      employeeCode: true,
      role: true,
      status: true,
      passwordHash: true,
    },
  });

  console.log('Total users in database:', users.length);

  for (const u of users) {
    const isMatch = await argon2.verify(u.passwordHash, 'Visiblo@2025');
    console.log(`User: ${u.email} | Code: ${u.employeeCode} | Role: ${u.role} | Password Visiblo@2025 matches: ${isMatch}`);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());

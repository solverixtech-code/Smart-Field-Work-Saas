import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'vikram.singh@visibloai.com' },
    select: { id: true, email: true, fullName: true },
  });

  if (!user) {
    console.log('User vikram.singh@visibloai.com not found!');
    return;
  }

  console.log(`Found user: ${user.fullName} (${user.id})`);

  const tokens = await prisma.devicePushToken.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Total device push tokens for ${user.fullName}:`, tokens.length);
  console.dir(tokens, { depth: null });
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.roles.createMany({
    data: [
      {
        title: 'user',
        description: 'Users with basic access.',
      },
      { title: 'admin', description: 'Administrators with elevated access.' },
    ],
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

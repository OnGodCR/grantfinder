import { prisma } from '../prisma.js';

async function main() {
  // Seed a sample institution
  const inst = await prisma.institution.upsert({
    where: { name: 'Acme University' },
    update: {},
    create: { name: 'Acme University', domain: 'acme.edu', plan: 'starter', seats: 50 },
  });
  console.log('Seeded institution', inst.id);
}

main().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});

import bcrypt from 'bcryptjs';
import { prisma } from './lib/prisma.js';

const accounts = [
  {
    email: 'admin@crms.local',
    phone: '01700000001',
    name: 'CRMS Admin',
    role: 'ADMIN',
    password: 'Admin@12345',
  },
  {
    email: 'user@crms.local',
    phone: '01700000002',
    name: 'CRMS User',
    role: 'MEMBER',
    password: 'User@12345',
  },
];

async function main() {
  const company = await prisma.clientCompany.upsert({
    where: { id: 'crms-demo-company' },
    update: {},
    create: { id: 'crms-demo-company', name: 'CRMS Demo Company', monthlyQuotaHrs: 20 },
  });
  for (const account of accounts) {
    await prisma.user.upsert({
      where: { email: account.email },
      update: {
        name: account.name,
        phone: account.phone,
        role: account.role,
        passwordHash: await bcrypt.hash(account.password, 12),
        companyId: company.id,
      },
      create: {
        email: account.email,
        phone: account.phone,
        name: account.name,
        role: account.role,
        passwordHash: await bcrypt.hash(account.password, 12),
        companyId: company.id,
      },
    });
  }
  const rooms = [
    {
      name: 'Boardroom A',
      capacity: 8,
      equipmentList: ['Whiteboard', 'AV Display', 'Video Conference Bar'],
      hourlyRate: 25,
    },
    {
      name: 'Meeting Room B',
      capacity: 6,
      equipmentList: ['Whiteboard', 'AV Display'],
      hourlyRate: 18,
    },
    { name: 'Focus Room 02', capacity: 4, equipmentList: ['Whiteboard'], hourlyRate: 12 },
  ];
  for (const room of rooms) {
    const existing = await prisma.conferenceRoom.findFirst({ where: { name: room.name } });
    if (existing) await prisma.conferenceRoom.update({ where: { id: existing.id }, data: room });
    else await prisma.conferenceRoom.create({ data: room });
  }
  console.log('Admin and member accounts created successfully.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());

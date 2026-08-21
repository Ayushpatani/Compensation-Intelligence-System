import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL environment variable is missing.');
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString: dbUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('Seeding database...');
  
  // Clean up
  await prisma.levelMapping.deleteMany({});
  await prisma.salaryEntry.deleteMany({});
  await prisma.company.deleteMany({});

  // Seed companies
  const google = await prisma.company.create({
    data: {
      name: 'Google',
      averageCompensation: 335000,
      entryCount: 4,
    }
  });

  const meta = await prisma.company.create({
    data: {
      name: 'Meta',
      averageCompensation: 380000,
      entryCount: 4,
    }
  });

  const amazon = await prisma.company.create({
    data: {
      name: 'Amazon',
      averageCompensation: 256666,
      entryCount: 3,
    }
  });

  // Seed salaries
  await prisma.salaryEntry.createMany({
    data: [
      // Google
      {
        companyId: google.id,
        title: 'Software Engineer',
        level: 'L3',
        base: 135000,
        stock: 35000,
        bonus: 15000,
        totalCompensation: 185000,
        location: 'Mountain View, CA',
        yearsOfExperience: 1,
      },
      {
        companyId: google.id,
        title: 'Software Engineer',
        level: 'L4',
        base: 165000,
        stock: 55000,
        bonus: 25000,
        totalCompensation: 245000,
        location: 'New York, NY',
        yearsOfExperience: 3,
      },
      {
        companyId: google.id,
        title: 'Senior Software Engineer',
        level: 'L5',
        base: 200000,
        stock: 120000,
        bonus: 40000,
        totalCompensation: 360000,
        location: 'San Francisco, CA',
        yearsOfExperience: 6,
      },
      {
        companyId: google.id,
        title: 'Staff Software Engineer',
        level: 'L6',
        base: 250000,
        stock: 240000,
        bonus: 60000,
        totalCompensation: 550000,
        location: 'Mountain View, CA',
        yearsOfExperience: 10,
      },
      // Meta
      {
        companyId: meta.id,
        title: 'Software Engineer',
        level: 'E3',
        base: 140000,
        stock: 40000,
        bonus: 15000,
        totalCompensation: 195000,
        location: 'Menlo Park, CA',
        yearsOfExperience: 1,
      },
      {
        companyId: meta.id,
        title: 'Software Engineer',
        level: 'E4',
        base: 170000,
        stock: 80000,
        bonus: 20000,
        totalCompensation: 270000,
        location: 'Seattle, WA',
        yearsOfExperience: 3.5,
      },
      {
        companyId: meta.id,
        title: 'Senior Software Engineer',
        level: 'E5',
        base: 210000,
        stock: 150000,
        bonus: 45000,
        totalCompensation: 405000,
        location: 'Menlo Park, CA',
        yearsOfExperience: 7,
      },
      {
        companyId: meta.id,
        title: 'Staff Software Engineer',
        level: 'E6',
        base: 260000,
        stock: 320000,
        bonus: 70000,
        totalCompensation: 650000,
        location: 'New York, NY',
        yearsOfExperience: 11,
      },
      // Amazon
      {
        companyId: amazon.id,
        title: 'Software Development Engineer I',
        level: 'L4',
        base: 125000,
        stock: 25000,
        bonus: 15000,
        totalCompensation: 165000,
        location: 'Seattle, WA',
        yearsOfExperience: 0.5,
      },
      {
        companyId: amazon.id,
        title: 'Software Development Engineer II',
        level: 'L5',
        base: 160000,
        stock: 65000,
        bonus: 20000,
        totalCompensation: 245000,
        location: 'Austin, TX',
        yearsOfExperience: 4,
      },
      {
        companyId: amazon.id,
        title: 'Senior Software Development Engineer',
        level: 'L6',
        base: 185000,
        stock: 140000,
        bonus: 35000,
        totalCompensation: 360000,
        location: 'Seattle, WA',
        yearsOfExperience: 8,
      },
    ]
  });

  // Seed level mapping
  await prisma.levelMapping.createMany({
    data: [
      { companyName: 'Google', level: 'L3', equivalentRank: 3 },
      { companyName: 'Google', level: 'L4', equivalentRank: 4 },
      { companyName: 'Google', level: 'L5', equivalentRank: 5 },
      { companyName: 'Google', level: 'L6', equivalentRank: 6 },
      { companyName: 'Meta', level: 'E3', equivalentRank: 3 },
      { companyName: 'Meta', level: 'E4', equivalentRank: 4 },
      { companyName: 'Meta', level: 'E5', equivalentRank: 5 },
      { companyName: 'Meta', level: 'E6', equivalentRank: 6 },
      { companyName: 'Amazon', level: 'L4', equivalentRank: 3 },
      { companyName: 'Amazon', level: 'L5', equivalentRank: 4 },
      { companyName: 'Amazon', level: 'L6', equivalentRank: 5 },
    ]
  });

  console.log('Seeding completed successfully!');
  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error('Error seeding database:', err);
  process.exit(1);
});

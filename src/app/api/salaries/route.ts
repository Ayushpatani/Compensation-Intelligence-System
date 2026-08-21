import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SalaryEntrySchema } from '@/lib/validation';
import { normalizeCompanyName, normalizeTitle } from '@/lib/normalization';

export const dynamic = 'force-dynamic';

// GET: Fetch list of salaries with filtering, sorting, and pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const company = searchParams.get('company') || '';
    const title = searchParams.get('title') || '';
    const level = searchParams.get('level') || '';
    const location = searchParams.get('location') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '20'));
    const skip = (page - 1) * limit;

    // Build Prisma query filter
    const where: any = { AND: [] };

    if (search) {
      where.AND.push({
        OR: [
          { company: { name: { contains: search, mode: 'insensitive' } } },
          { title: { contains: search, mode: 'insensitive' } },
          { level: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (company) {
      where.AND.push({
        company: { name: { equals: normalizeCompanyName(company), mode: 'insensitive' } }
      });
    }

    if (title) {
      where.AND.push({
        title: { contains: title, mode: 'insensitive' }
      });
    }

    if (level) {
      where.AND.push({
        level: { equals: level, mode: 'insensitive' }
      });
    }

    if (location) {
      where.AND.push({
        location: { contains: location, mode: 'insensitive' }
      });
    }

    // Default sorting options
    const validSortFields = ['totalCompensation', 'base', 'stock', 'bonus', 'yearsOfExperience', 'createdAt'];
    const activeSortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const activeSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

    // Fetch entries
    const [entries, total] = await Promise.all([
      prisma.salaryEntry.findMany({
        where,
        include: {
          company: {
            select: {
              name: true,
              logoUrl: true,
            }
          }
        },
        orderBy: {
          [activeSortField]: activeSortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.salaryEntry.count({ where }),
    ]);

    return NextResponse.json({
      data: entries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error: any) {
    console.error('Error fetching salaries:', error);
    return NextResponse.json({ error: 'Failed to fetch salaries', details: error.message }, { status: 500 });
  }
}

// POST: Ingest salary
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 1. Validate incoming data
    const parseResult = SalaryEntrySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors
      }, { status: 400 });
    }

    const input = parseResult.data;

    // 2. Normalization
    const normalizedCompany = normalizeCompanyName(input.company);
    const normalizedTitle = normalizeTitle(input.title);
    const normalizedLevel = input.level.trim().toUpperCase();

    // Default missing stock and bonus to 0 (already handled by Zod default, but explicitly safe)
    const base = input.base;
    const stock = input.stock ?? 0;
    const bonus = input.bonus ?? 0;

    // Calculate total compensation
    const totalCompensation = base + stock + bonus;

    // 3. Deduplication Check
    // Query if an identical submission exists in the database
    const existingDuplicate = await prisma.salaryEntry.findFirst({
      where: {
        title: normalizedTitle,
        level: normalizedLevel,
        base,
        stock,
        bonus,
        location: input.location.trim(),
        yearsOfExperience: input.yearsOfExperience,
        company: {
          name: normalizedCompany,
        },
      },
    });

    if (existingDuplicate) {
      return NextResponse.json({
        error: 'Duplicate entry detected',
        message: 'A compensation record with the exact same details already exists.'
      }, { status: 409 });
    }

    // 4. Find or Create Company and Save Salary Entry
    // We execute this in a transaction to guarantee data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Find or create the company
      let companyObj = await tx.company.findUnique({
        where: { name: normalizedCompany },
      });

      if (!companyObj) {
        companyObj = await tx.company.create({
          data: {
            name: normalizedCompany,
            averageCompensation: totalCompensation,
            entryCount: 1,
          },
        });
      } else {
        // Recalculate average compensation
        const newCount = companyObj.entryCount + 1;
        const newAverage = ((companyObj.averageCompensation * companyObj.entryCount) + totalCompensation) / newCount;
        
        companyObj = await tx.company.update({
          where: { id: companyObj.id },
          data: {
            entryCount: newCount,
            averageCompensation: newAverage,
          },
        });
      }

      // Create the salary entry
      const entry = await tx.salaryEntry.create({
        data: {
          companyId: companyObj.id,
          title: normalizedTitle,
          level: normalizedLevel,
          base,
          stock,
          bonus,
          totalCompensation,
          location: input.location.trim(),
          yearsOfExperience: input.yearsOfExperience,
          yearsAtCompany: input.yearsAtCompany,
        },
        include: {
          company: {
            select: {
              name: true,
            }
          }
        }
      });

      return entry;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error ingesting salary:', error);
    return NextResponse.json({ error: 'Failed to save salary entry', details: error.message }, { status: 500 });
  }
}

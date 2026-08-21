import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const minEntries = parseInt(searchParams.get('minEntries') || '0');

    const where: any = {
      entryCount: { gte: minEntries },
    };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const companies = await prisma.company.findMany({
      where,
      orderBy: {
        entryCount: 'desc',
      },
    });

    return NextResponse.json(companies);
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ error: 'Failed to fetch companies', details: error.message }, { status: 500 });
  }
}

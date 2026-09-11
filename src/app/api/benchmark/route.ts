import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compensationStats, marketPosition, percentileRank } from '@/lib/compensation';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title')?.trim() || '';
    const location = searchParams.get('location')?.trim() || '';
    const level = searchParams.get('level')?.trim() || '';
    const company = searchParams.get('company')?.trim() || '';
    const compensation = Number(searchParams.get('compensation') || 0);

    if (!title && !company) {
      return NextResponse.json({ error: 'Provide at least a title or company.' }, { status: 400 });
    }

    const where: any = { AND: [] };
    if (title) where.AND.push({ title: { contains: title, mode: 'insensitive' } });
    if (location) where.AND.push({ location: { contains: location, mode: 'insensitive' } });
    if (level) where.AND.push({ level: { equals: level, mode: 'insensitive' } });
    if (company) where.AND.push({ company: { name: { contains: company, mode: 'insensitive' } } });

    const entries = await prisma.salaryEntry.findMany({
      where,
      select: {
        totalCompensation: true,
        base: true,
        bonus: true,
        stock: true,
        yearsOfExperience: true,
        title: true,
        level: true,
        location: true,
        company: { select: { name: true } },
      },
      take: 500,
    });

    const stats = compensationStats(entries);
    const values = entries.map((entry) => entry.totalCompensation);
    const rank = compensation > 0 ? percentileRank(values, compensation) : null;
    const position = compensation > 0 ? marketPosition(compensation, stats.median) : null;

    const topCompanies = Object.entries(
      entries.reduce<Record<string, { total: number; count: number }>>((acc, entry) => {
        const name = entry.company.name;
        acc[name] ??= { total: 0, count: 0 };
        acc[name].total += entry.totalCompensation;
        acc[name].count += 1;
        return acc;
      }, {}),
    )
      .map(([name, value]) => ({ name, average: value.total / value.count, count: value.count }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 5);

    return NextResponse.json({
      query: { title, location, level, company },
      stats,
      percentileRank: rank,
      position,
      sampleSize: entries.length,
      topCompanies,
    });
  } catch (error: any) {
    console.error('Benchmark error:', error);
    return NextResponse.json({ error: 'Failed to calculate benchmark', details: error.message }, { status: 500 });
  }
}

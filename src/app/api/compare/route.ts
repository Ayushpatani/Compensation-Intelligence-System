import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeCompanyName } from '@/lib/normalization';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode'); // 'equivalent' or undefined
    const targetsParam = searchParams.get('targets'); // e.g. "Google-L4,Meta-E4"
    
    if (!targetsParam) {
      return NextResponse.json({ error: "Missing 'targets' query parameter. Example: targets=Google-L4,Meta-E4" }, { status: 400 });
    }

    let parsedTargets = targetsParam.split(',').map(t => {
      const parts = t.split('-');
      if (parts.length < 2) return null;
      const level = parts[parts.length - 1].trim();
      const company = parts.slice(0, -1).join('-').trim();
      return { company, level };
    }).filter(t => t !== null) as { company: string; level: string }[];

    if (parsedTargets.length === 0) {
      return NextResponse.json({ error: "Invalid targets format. Expected: Company-Level" }, { status: 400 });
    }

    if (mode === 'equivalent' && parsedTargets.length === 1) {
      // Find equivalent levels for the single target
      const sourceTarget = parsedTargets[0];
      const normalizedSourceCompany = normalizeCompanyName(sourceTarget.company);
      
      const sourceMapping = await prisma.levelMapping.findFirst({
        where: {
          companyName: { equals: normalizedSourceCompany, mode: 'insensitive' },
          level: { equals: sourceTarget.level, mode: 'insensitive' }
        }
      });

      if (sourceMapping) {
        const equivalentMappings = await prisma.levelMapping.findMany({
          where: {
            equivalentRank: sourceMapping.equivalentRank,
            companyName: { not: normalizedSourceCompany }
          }
        });

        // Add up to 3 equivalent targets
        const additionalTargets = equivalentMappings.slice(0, 3).map(m => ({
          company: m.companyName,
          level: m.level
        }));
        
        parsedTargets = [sourceTarget, ...additionalTargets];
      }
    }

    const results = await Promise.all(parsedTargets.map(async ({ company, level }) => {
      const normalizedCompany = normalizeCompanyName(company);
      const normalizedLevel = level.toUpperCase();

      const entries = await prisma.salaryEntry.findMany({
        where: {
          level: { equals: normalizedLevel, mode: 'insensitive' },
          company: { name: { equals: normalizedCompany, mode: 'insensitive' } }
        }
      });

      const count = entries.length;
      if (count === 0) {
        return {
          company: normalizedCompany,
          level: normalizedLevel,
          count: 0,
          averages: { totalCompensation: 0, base: 0, stock: 0, bonus: 0, yearsOfExperience: 0 }
        };
      }

      const sum = entries.reduce((acc, entry) => {
        acc.totalCompensation += entry.totalCompensation;
        acc.base += entry.base;
        acc.stock += entry.stock;
        acc.bonus += entry.bonus;
        acc.yearsOfExperience += entry.yearsOfExperience;
        return acc;
      }, { totalCompensation: 0, base: 0, stock: 0, bonus: 0, yearsOfExperience: 0 });

      return {
        company: normalizedCompany,
        level: normalizedLevel,
        count,
        averages: {
          totalCompensation: Math.round(sum.totalCompensation / count),
          base: Math.round(sum.base / count),
          stock: Math.round(sum.stock / count),
          bonus: Math.round(sum.bonus / count),
          yearsOfExperience: Number((sum.yearsOfExperience / count).toFixed(1))
        }
      };
    }));

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error fetching comparison data:', error);
    return NextResponse.json({ error: 'Failed to fetch comparison data', details: error.message }, { status: 500 });
  }
}

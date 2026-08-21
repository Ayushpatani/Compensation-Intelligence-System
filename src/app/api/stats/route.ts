import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [totalSubmissions, companiesCount, compStats] = await Promise.all([
      prisma.salaryEntry.count(),
      prisma.company.count(),
      prisma.salaryEntry.aggregate({
        _avg: {
          totalCompensation: true,
        },
      }),
    ]);

    return NextResponse.json({
      totalSubmissions,
      companiesCount,
      avgCompensation: compStats._avg.totalCompensation || 0,
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

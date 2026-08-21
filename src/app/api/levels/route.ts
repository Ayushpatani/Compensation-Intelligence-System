import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const levels = await prisma.salaryEntry.findMany({
      select: {
        level: true,
      },
      distinct: ["level"],
      orderBy: {
        level: "asc",
      },
    });

    return NextResponse.json(levels.map((l) => l.level));
  } catch (error) {
    console.error("Failed to fetch levels:", error);
    return NextResponse.json(
      { error: "Failed to fetch levels" },
      { status: 500 }
    );
  }
}

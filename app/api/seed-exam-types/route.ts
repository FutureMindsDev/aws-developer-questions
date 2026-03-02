import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import type { ExamType } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminPassword } = body;

    if (adminPassword !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const collection = db.collection("examTypes");

    // Check if exam types already exist
    const existingCount = await collection.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json({
        message: "Exam types already exist",
        count: existingCount,
      });
    }

    // Initial exam types
    const initialExamTypes: Omit<ExamType, "_id">[] = [
      {
        id: "1",
        name: "aws-developer",
        displayName: "AWS Developer",
        description:
          "AWS Certified Developer - Associate (DVA-C02) exam questions",
        createdAt: new Date(),
        active: true,
      },
      {
        id: "2",
        name: "lpic-1",
        displayName: "LPIC-1",
        description:
          "Linux Professional Institute Certification Level 1 exam questions",
        createdAt: new Date(),
        active: true,
      },
    ];

    // Insert initial exam types
    const result = await collection.insertMany(initialExamTypes);

    return NextResponse.json({
      message: `Successfully seeded ${result.insertedCount} exam types`,
      examTypes: initialExamTypes.map((et) => ({
        name: et.name,
        displayName: et.displayName,
      })),
    });
  } catch (error) {
    console.error("[v0] Error seeding exam types:", error);
    return NextResponse.json(
      { error: "Failed to seed exam types" },
      { status: 500 },
    );
  }
}

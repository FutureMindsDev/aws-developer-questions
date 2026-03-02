import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminPassword } = body;

    if (adminPassword !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const questionsCollection = db.collection("questions");

    // Find all questions that don't have an examType field
    const questionsWithoutExamType = await questionsCollection
      .find({
        examType: { $exists: false },
      })
      .toArray();

    console.log(
      `Found ${questionsWithoutExamType.length} questions without examType`,
    );

    if (questionsWithoutExamType.length > 0) {
      // Update all questions without examType to have "aws-developer" as default
      const result = await questionsCollection.updateMany(
        { examType: { $exists: false } },
        { $set: { examType: "aws-developer" } },
      );

      return NextResponse.json({
        message: `Successfully updated ${result.modifiedCount} questions with examType="aws-developer"`,
        updatedCount: result.modifiedCount,
      });
    } else {
      return NextResponse.json({
        message: "All questions already have examType field",
        updatedCount: 0,
      });
    }
  } catch (error) {
    console.error("[v0] Error updating questions:", error);
    return NextResponse.json(
      { error: "Failed to update questions" },
      { status: 500 },
    );
  }
}

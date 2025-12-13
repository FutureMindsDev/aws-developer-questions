import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const {
      question,
      options,
      answer,
      explanation,
      number,
      approved,
      linkUrl,
      adminPassword,
    } = body;

    // Verify admin password
    if (adminPassword !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();

    const updateFields: Record<string, unknown> = {};

    if (question !== undefined) updateFields.question = question;
    if (options !== undefined) updateFields.options = options;
    if (answer !== undefined) updateFields.answer = answer;
    if (explanation !== undefined) updateFields.explanation = explanation || "";
    if (number !== undefined) updateFields.number = number;
    if (approved !== undefined) updateFields.approved = approved;
    if (linkUrl !== undefined) updateFields.linkUrl = linkUrl;

    const result = await db.collection("questions").updateOne(
      { id: params.id },
      {
        $set: updateFields,
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Error updating question:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const { adminPassword } = body;

    // Verify admin password
    if (adminPassword !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const result = await db
      .collection("questions")
      .deleteOne({ id: params.id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Error deleting question:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 },
    );
  }
}

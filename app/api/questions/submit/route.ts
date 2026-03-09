import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import type { Question } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      question,
      questionImages,
      options,
      answer,
      explanation,
      number,
      linkUrl,
      examType,
    } = body;

    if (!question || !answer || !linkUrl) {
      return NextResponse.json(
        { error: "question, answer and linkUrl are required" },
        { status: 400 },
      );
    }

    const db = await getDatabase();

    const newQuestion: Omit<Question, "_id"> = {
      id: crypto.randomUUID(),
      question,
      questionImages:
        Array.isArray(questionImages) && questionImages.length > 0
          ? questionImages
          : undefined,
      options: options || [],
      answer,
      explanation: explanation || "",
      number,
      linkUrl,
      examType: examType || "aws-developer", // Default to aws-developer for backward compatibility
      approved: false,
      createdAt: new Date(),
    };

    const result = await db.collection("questions").insertOne(newQuestion);

    return NextResponse.json(
      { ...newQuestion, _id: result.insertedId.toString() },
      { status: 201 },
    );
  } catch (error) {
    console.error("[v0] Error creating public question:", error);
    return NextResponse.json(
      { error: "Failed to submit question" },
      { status: 500 },
    );
  }
}

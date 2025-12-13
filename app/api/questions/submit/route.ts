import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import type { Question } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, options, answer, explanation, number, linkUrl } = body;

    if (!question || !answer || !linkUrl) {
      return NextResponse.json(
        { error: "question, answer and linkUrl are required" },
        { status: 400 },
      );
    }

    const db = await getDatabase();

    const newQuestion: Omit<Question, "_id"> = {
      id: Date.now().toString(),
      question,
      options: options || [],
      answer,
      explanation: explanation || "",
      number,
      linkUrl,
      approved: false,
      createdAt: new Date(),
    };

    const result = await db.collection("questions").insertOne(newQuestion);

    return NextResponse.json(
      { ...newQuestion, _id: result.insertedId },
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

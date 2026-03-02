import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import type { ExamType } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();

    const examTypes = await db
      .collection<ExamType>("examTypes")
      .find({ active: { $ne: false } })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json(examTypes);
  } catch (error) {
    console.error("[v0] Error fetching exam types:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam types" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, displayName, description, adminPassword } = body;

    if (adminPassword !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!name || !displayName) {
      return NextResponse.json(
        { error: "Name and display name are required" },
        { status: 400 },
      );
    }

    const db = await getDatabase();

    // Check if exam type with same name already exists
    const existing = await db.collection("examTypes").findOne({ name });
    if (existing) {
      return NextResponse.json(
        { error: "Exam type with this name already exists" },
        { status: 409 },
      );
    }

    const newExamType: Omit<ExamType, "_id"> = {
      id: Date.now().toString(),
      name: name.toLowerCase().replace(/\s+/g, "-"),
      displayName,
      description: description || "",
      createdAt: new Date(),
      active: true,
    };

    const result = await db.collection("examTypes").insertOne(newExamType);

    return NextResponse.json({ ...newExamType, _id: result.insertedId });
  } catch (error) {
    console.error("[v0] Error creating exam type:", error);
    return NextResponse.json(
      { error: "Failed to create exam type" },
      { status: 500 },
    );
  }
}

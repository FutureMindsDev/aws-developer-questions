import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import type { Question } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const scope = searchParams.get("scope") || "all";
    const examType = searchParams.get("examType") || "";
    const skip = (page - 1) * limit;

    const db = await getDatabase();

    const searchFilter = search
      ? {
          $or: [
            { question: { $regex: search, $options: "i" } },
            { options: { $elemMatch: { $regex: search, $options: "i" } } },
            { answer: { $regex: search, $options: "i" } },
            { explanation: { $regex: search, $options: "i" } },
            ...(isNaN(Number(search)) ? [] : [{ number: Number(search) }]),
          ],
        }
      : {};

    const filters: Record<string, unknown>[] = [];

    if (Object.keys(searchFilter).length > 0) {
      filters.push(searchFilter);
    }

    if (examType) {
      filters.push({ examType });
    }

    if (scope === "public") {
      // Public view: only show approved questions or legacy ones without the approved field
      filters.push({
        $or: [{ approved: true }, { approved: { $exists: false } }],
      });
    } else if (scope === "pending") {
      // Admin approval view: only unapproved questions
      filters.push({ approved: false });
    }

    const finalFilter = filters.length > 0 ? { $and: filters } : {};

    const questions = await db
      .collection<Question>("questions")
      .find(finalFilter)
      .sort({ number: -1, order: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db
      .collection<Question>("questions")
      .countDocuments(finalFilter);

    return NextResponse.json({
      data: questions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[v0] Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      question,
      options,
      answer,
      explanation,
      number,
      adminPassword,
      linkUrl,
      examType,
    } = body;

    if (adminPassword !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const newQuestion: Omit<Question, "_id"> = {
      id: Date.now().toString(),
      question,
      options,
      answer,
      explanation: explanation || "",
      number: number,
      createdAt: new Date(),
      approved: true,
      linkUrl,
      examType: examType || "aws-developer", // Default to aws-developer for backward compatibility
    };

    const result = await db.collection("questions").insertOne(newQuestion);

    return NextResponse.json({ ...newQuestion, _id: result.insertedId });
  } catch (error) {
    console.error("[v0] Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 },
    );
  }
}

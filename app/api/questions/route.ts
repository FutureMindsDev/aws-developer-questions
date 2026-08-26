import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import type { Question } from "@/lib/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const scope = searchParams.get("scope") || "public";
  const examType = searchParams.get("examType") || "";
  const sort = searchParams.get("sort") || "default";

  const filter: any = {};

  if (scope === "public") {
    filter.approved = true;
  }

  if (examType) {
    filter.examType = examType;
  }

  if (search) {
    filter.question = { $regex: search, $options: "i" };
  }

  const sortOptions: any =
    sort === "latest"
      ? { createdAt: -1, _id: -1 }
      : { number: -1, order: 1 };

  const skip = (page - 1) * limit;

  await connectToDatabase();

  const questions = await Question.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Question.countDocuments(filter);

  return NextResponse.json({
    data: questions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      question,
      questionImages,
      options,
      answer,
      answerType,
      answerSubType,
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
      id: crypto.randomUUID(),
      question,
      questionImages:
        Array.isArray(questionImages) && questionImages.length > 0
          ? questionImages
          : undefined,
      options: answerType === "single_choice" ? options : undefined,
      answer,
      answerType: answerType || "single_choice",
      answerSubType: answerType === "single_choice" ? answerSubType : undefined,
      explanation: explanation || "",
      number: number,
      createdAt: new Date(),
      approved: true,
      linkUrl,
      examType: examType || "aws-developer", // Default to aws-developer for backward compatibility
    };

    const result = await db.collection("questions").insertOne(newQuestion);

    return NextResponse.json({
      ...newQuestion,
      _id: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("[v0] Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 },
    );
  }
}

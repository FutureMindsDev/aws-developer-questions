import { NextResponse } from "next/server";
import { getLatestQuestions } from "@/lib/questions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const questions = await getLatestQuestions(3);
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Failed to fetch latest questions", error);
    return NextResponse.json(
      { error: "Unable to load latest questions." },
      { status: 500 },
    );
  }
}
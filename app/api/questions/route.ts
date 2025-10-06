import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Question } from "@/lib/types"

export async function GET() {
  try {
    const db = await getDatabase()
    const questions = await db.collection<Question>("questions").find({}).toArray()

    return NextResponse.json(questions)
  } catch (error) {
    console.error("[v0] Error fetching questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, options, answer, explanation, adminPassword } = body

    // Verify admin password
    if (adminPassword !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const newQuestion: Omit<Question, "_id"> = {
      id: Date.now().toString(),
      question,
      options,
      answer,
      explanation: explanation || "",
    }

    const result = await db.collection("questions").insertOne(newQuestion)

    return NextResponse.json({ ...newQuestion, _id: result.insertedId })
  } catch (error) {
    console.error("[v0] Error creating question:", error)
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}

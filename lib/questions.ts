import { connectToDatabase } from "@/lib/mongodb";

export interface PublicQuestion {
  _id: string;
  question?: string;
  text?: string;
  title?: string;
  answer?: string;
  examType?: string;
  category?: string;
  createdAt?: string | Date;
}

export async function getLatestQuestions(limit = 3): Promise<PublicQuestion[]> {
  const db = await connectToDatabase();
  const questions = await db
    .collection("questions")
    .find({ approved: { $ne: false } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return questions.map(({ _id, ...question }) => ({
    ...question,
    _id: _id.toString(),
  })) as PublicQuestion[];
}
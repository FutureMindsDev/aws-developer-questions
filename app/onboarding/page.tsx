import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth-guard";
import {
  SampleQuestions,
  type SampleQuestion,
} from "@/components/onboarding/sample-questions";
import { getDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const fallbackQuestions: SampleQuestion[] = [
  {
    id: "fallback-1",
    question: "How do I reset my password?",
    answer:
      "Open the login page, click “Forgot password”, and follow the instructions we send to your email.",
  },
  {
    id: "fallback-2",
    question: "How can I update my profile information?",
    answer:
      "Go to your profile settings, edit the fields you want to change, and save your updates.",
  },
  {
    id: "fallback-3",
    question: "Where can I see the latest questions?",
    answer:
      "After logging in, the home page shows the most recent questions sorted by creation date.",
  },
];

async function getLatestQuestions(): Promise<SampleQuestion[]> {
  try {
    const db = await getDatabase();
    const questions = (await db
      .collection("questions")
      .find({ approved: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray()) as Array<{
      _id: unknown;
      question?: string;
      answer?: string;
    }>;

    return questions
      .filter((question) => Boolean(question.question && question.answer))
      .map((question) => ({
        id: String(question._id),
        question: question.question as string,
        answer: question.answer as string,
      }));
  } catch {
    return [];
  }
}

export default async function OnboardingPage() {
  const hour = new Date().getHours();

  let greeting = "Good evening";
  if (hour >= 5 && hour <= 11) {
    greeting = "Good morning";
  } else if (hour >= 12 && hour <= 17) {
    greeting = "Good afternoon";
  }

  const latestQuestions = await getLatestQuestions();
  const samples = [...latestQuestions, ...fallbackQuestions].slice(0, 3);

  return (
    <AuthGuard requireAuth={false}>
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-16">
        <section className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {greeting}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Welcome to our Q&amp;A community. Explore a few recent questions
            below, then log in to ask your own.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Get started</Link>
            </Button>
          </div>
        </section>

        <section className="w-full">
          <h2 className="mb-6 text-center text-2xl font-semibold">
            Latest questions
          </h2>
          <SampleQuestions samples={samples} />
        </section>
      </main>
    </AuthGuard>
  );
}
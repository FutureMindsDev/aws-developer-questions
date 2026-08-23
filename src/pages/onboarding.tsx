import type { GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { sampleLatestQuestions, LatestQuestion } from "../lib/sampleQuestions";

export const getStaticProps: GetStaticProps<{ questions: LatestQuestion[] }> = async () => {
  return {
    props: {
      questions: sampleLatestQuestions,
    },
  };
};

export default function Onboarding({
  questions,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Head>
        <title>Welcome | AWS Developer Questions</title>
      </Head>

      <h1 className="text-3xl font-bold text-slate-900">
        Welcome to AWS Developer Questions
      </h1>
      <p className="mt-3 text-slate-600">
        Sign in or create an account to start practicing real AWS
        Developer Associate-style questions and track your progress.
      </p>

      <div className="mt-6 flex flex-wrap gap-4">
        <Link
          href="/login"
          className="rounded-md bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded-md border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
        >
          Create an account
        </Link>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-slate-900">
          Sample latest questions
        </h2>
        <p className="mt-1 text-slate-500">
          Here are a few of the most recent questions to give you a feel for
          what&apos;s inside.
        </p>

        <div className="mt-6 space-y-6">
          {questions.slice(0, 3).map((question) => (
            <article
              key={question.id}
              className="rounded-lg border border-slate-200 p-5"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                {question.category}
              </p>
              <h3 className="mt-1 font-medium text-slate-900">
                {question.question}
              </h3>
              <p className="mt-2 text-slate-600">{question.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
import { Link } from 'react-router-dom';
import { sampleLatestQuestions } from '../data/sampleLatestQuestions';

export function OnboardingPage() {
  return (
    <main className="onboarding-page">
      <section className="onboarding-page__hero">
        <h1>Welcome to Q&A Hub</h1>
        <p>Join the community to ask questions, share answers, and connect with other developers.</p>
        <div className="onboarding-page__actions">
          <Link to="/login" className="btn btn-primary">Sign in</Link>
          <Link to="/register" className="btn btn-secondary">Create an account</Link>
        </div>
      </section>

      <section className="onboarding-page__latest">
        <h2>Latest questions</h2>
        {sampleLatestQuestions.map((question) => (
          <article key={question.id} className="onboarding-page__question">
            <h3>{question.title}</h3>
            <p>{question.body}</p>
            <div className="onboarding-page__answers">
              {question.answers.map((answer) => (
                <div key={answer.id} className="onboarding-page__answer">
                  <strong>{answer.author}</strong>
                  <p>{answer.content}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
import { useEffect } from 'react';
import onboardingQuestions from '../constants/onboardingQuestions';

export default function OnboardingPage() {
  useEffect(() => {
    document.title = 'Onboarding';
  }, []);

  return (
    <main className="onboarding-page">
      <h1>Welcome to Q&A Platform</h1>
      <p>Get started by exploring the latest questions and answers.</p>

      <section className="latest-questions" aria-labelledby="latest-questions-heading">
        <h2 id="latest-questions-heading">Latest Questions</h2>
        <ul>
          {onboardingQuestions.map(({ id, question, answer }) => (
            <li key={id}>
              <h3>{question}</h3>
              <p>{answer}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
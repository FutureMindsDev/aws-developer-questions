export interface SampleAnswer {
  id: string;
  author: string;
  content: string;
}

export interface SampleQuestion {
  id: string;
  title: string;
  body: string;
  author: string;
  createdAt: string;
  answers: SampleAnswer[];
}

export const sampleLatestQuestions: SampleQuestion[] = [
  {
    id: 'sample-1',
    title: 'How do I set up authentication in React?',
    body: 'I am new to React and want to add login/signup to my app. What is the recommended approach?',
    author: 'new_developer',
    createdAt: '2025-01-04T10:00:00Z',
    answers: [
      {
        id: 'sample-1-answer-1',
        author: 'auth_expert',
        content: 'Start with an AuthContext and protect routes using a route guard component.',
      },
    ],
  },
  {
    id: 'sample-2',
    title: 'Best way to fetch latest questions from an API?',
    body: 'I need to display the most recent questions on a page. Should I fetch on mount or use a library?',
    author: 'curious_coder',
    createdAt: '2025-01-04T09:30:00Z',
    answers: [
      {
        id: 'sample-2-answer-1',
        author: 'api_guru',
        content: 'Fetch on mount with useEffect and handle loading/error states for the best user experience.',
      },
    ],
  },
  {
    id: 'sample-3',
    title: 'How should I structure a Q&A app router?',
    body: 'What is a clean way to organize routes and route guards in React Router?',
    author: 'app_builder',
    createdAt: '2025-01-04T08:45:00Z',
    answers: [
      {
        id: 'sample-3-answer-1',
        author: 'router_pro',
        content: 'Use a dedicated routes file and compose route guards around protected routes.',
      },
    ],
  },
];
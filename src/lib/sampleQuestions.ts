export interface LatestQuestion {
  id: string;
  category: string;
  question: string;
  answer: string;
  createdAt: string;
}

export const sampleLatestQuestions: LatestQuestion[] = [
  {
    id: "sample-1",
    category: "Compute",
    question: "What does EC2 provide in AWS?",
    answer:
      "Amazon EC2 (Elastic Compute Cloud) provides resizable, secure compute capacity in the cloud, allowing you to launch and manage virtual servers, known as instances.",
    createdAt: "2024-01-15T09:00:00.000Z",
  },
  {
    id: "sample-2",
    category: "Storage",
    question: "Which S3 storage class is best suited for long-term archival data?",
    answer:
      "S3 Glacier Deep Archive is the lowest-cost storage class designed for long-term retention of data that is accessed rarely, with retrieval times of 12 hours or more.",
    createdAt: "2024-01-14T09:00:00.000Z",
  },
  {
    id: "sample-3",
    category: "Networking",
    question: "What is the purpose of a VPC?",
    answer:
      "A Virtual Private Cloud (VPC) lets you provision a logically isolated section of the AWS cloud where you can launch AWS resources in a virtual network that you define.",
    createdAt: "2024-01-13T09:00:00.000Z",
  },
];
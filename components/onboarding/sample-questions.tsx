import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface SampleQuestion {
  id: string;
  question: string;
  answer: string;
}

interface SampleQuestionsProps {
  samples: SampleQuestion[];
}

export function SampleQuestions({ samples }: SampleQuestionsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {samples.map((sample) => (
        <Card key={sample.id} className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base leading-snug">
              {sample.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="mt-auto">
            <p className="text-sm text-muted-foreground">{sample.answer}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
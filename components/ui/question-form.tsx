import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";

interface QuestionFormData {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  number: string;
  linkUrl: string;
}

interface QuestionFormErrors {
  question: string;
  options: string[];
  answer: string;
  number: string;
  linkUrl: string;
}

interface QuestionFormProps {
  formData: QuestionFormData;
  errors: QuestionFormErrors;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: QuestionFormData) => void;
}

export function QuestionForm({
  formData,
  errors,
  onSubmit,
  onChange,
  submitLabel = "Submit",
}: QuestionFormProps & { submitLabel?: string }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="number">
          Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="number"
          type="number"
          placeholder="Question number (for sorting)"
          value={formData.number}
          onChange={(e) =>
            onChange({
              ...formData,
              number: e.target.value,
            })
          }
          className={`font-mono text-sm ${errors.number ? "border-destructive" : ""}`}
        />
        {errors.number && (
          <p className="text-sm text-destructive">{errors.number}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="question">
          Question <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="question"
          placeholder="Enter the question..."
          value={formData.question}
          onChange={(e) =>
            onChange({
              ...formData,
              question: e.target.value,
            })
          }
          className={`min-h-[100px] font-mono text-sm ${
            errors.question ? "border-destructive" : ""
          }`}
          required
        />
        {errors.question && (
          <p className="text-sm text-destructive">{errors.question}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="linkUrl">Source link (optional)</Label>
        <Input
          id="linkUrl"
          type="url"
          placeholder="https://example.com/where-you-found-this-question"
          value={formData.linkUrl}
          onChange={(e) =>
            onChange({
              ...formData,
              linkUrl: e.target.value,
            })
          }
          className={errors.linkUrl ? "border-destructive" : ""}
        />
        {errors.linkUrl && (
          <p className="text-sm text-destructive">{errors.linkUrl}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Options</Label>
        {formData.options.map((option, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-start space-x-2">
              <Textarea
                placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                value={option}
                onChange={(e) => {
                  const newOptions = [...formData.options];
                  newOptions[idx] = e.target.value;
                  onChange({
                    ...formData,
                    options: newOptions,
                  });
                }}
                className={`font-mono text-sm min-h-[60px] flex-1 ${
                  errors.options[idx] ? "border-destructive" : ""
                }`}
              />
              <Button
                variant={
                  formData.answer?.includes(String.fromCharCode(65 + idx))
                    ? "default"
                    : "outline"
                }
                onClick={(e) => {
                  e.preventDefault();
                  const answerArray = formData.answer
                    ? formData.answer.split(",").map((a) => a.trim())
                    : [];
                  const optionLetter = String.fromCharCode(65 + idx);

                  if (answerArray.includes(optionLetter)) {
                    const newAnswer = answerArray
                      .filter((a) => a !== optionLetter)
                      .join(", ");
                    onChange({
                      ...formData,
                      answer: newAnswer,
                    });
                  } else {
                    const newAnswer = [...answerArray, optionLetter].join(", ");
                    onChange({
                      ...formData,
                      answer: newAnswer,
                    });
                  }
                }}
                className={`h-10 w-10 rounded-md border flex items-center justify-center ${
                  formData.answer?.includes(String.fromCharCode(65 + idx))
                    ? "text-primary-foreground"
                    : "border-input"
                }`}
              >
                {formData.answer?.includes(String.fromCharCode(65 + idx)) && (
                  <CheckIcon className="h-5 w-5" />
                )}
              </Button>
            </div>
            {errors.options[idx] && (
              <p className="text-sm text-destructive">{errors.options[idx]}</p>
            )}
          </div>
        ))}
        <div className="text-sm text-muted-foreground mt-2">
          Click the checkmark next to each option to select it as an answer
        </div>
        {errors.answer && (
          <p className="text-sm text-destructive">{errors.answer}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="explanation">Explanation (Optional)</Label>
        <Textarea
          id="explanation"
          placeholder="Explain the answer..."
          value={formData.explanation}
          onChange={(e) =>
            onChange({
              ...formData,
              explanation: e.target.value,
            })
          }
          className="min-h-[100px] text-sm font-mono"
        />
      </div>

      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}

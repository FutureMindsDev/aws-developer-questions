import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckIcon, Upload, X } from "lucide-react";
import type { ExamType, AnswerType, AnswerSubType } from "@/lib/types";

export interface QuestionFormData {
  question: string;
  options?: string[];
  answer: string;
  answerType?: AnswerType;
  answerSubType?: AnswerSubType;
  explanation: string;
  number: string;
  linkUrl: string;
  examType?: string;
}

interface QuestionFormErrors {
  question: string;
  options?: string[];
  answer: string;
  number: string;
  linkUrl: string;
}

interface QuestionFormProps {
  formData: QuestionFormData;
  errors: QuestionFormErrors;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: QuestionFormData) => void;
  examTypes?: ExamType[];
}

export function QuestionForm({
  formData,
  errors,
  onSubmit,
  onChange,
  examTypes = [],
  submitLabel = "Submit",
}: QuestionFormProps & { submitLabel?: string }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="examType">Exam Type</Label>
        <Select
          value={formData.examType || "aws-developer"}
          onValueChange={(value) =>
            onChange({
              ...formData,
              examType: value,
            })
          }
        >
          <SelectTrigger className="dark:bg-input/30 bg-transparent">
            <SelectValue placeholder="Select exam type" />
          </SelectTrigger>
          <SelectContent>
            {examTypes.map((examType) => (
              <SelectItem key={examType.id} value={examType.name}>
                {examType.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="number">
          Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="number"
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
        <Label htmlFor="answerType">Answer Type</Label>
        <Select
          value={formData.answerType || ""}
          onValueChange={(value: AnswerType) => {
            const newData = {
              ...formData,
              answerType: value,
              answerSubType: undefined,
              options: value === "single_choice" ? ["", "", "", ""] : undefined,
              answer: "",
            };
            onChange(newData);
          }}
        >
          <SelectTrigger className="dark:bg-input/30 bg-transparent">
            <SelectValue placeholder="Select answer type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single_choice">Single Choice</SelectItem>
            <SelectItem value="string">String</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.answerType === "single_choice" && (
        <div className="space-y-2">
          <Label htmlFor="answerSubType">Answer Format</Label>
          <Select
            value={formData.answerSubType || "string"}
            onValueChange={(value: AnswerSubType) => {
              const newData = {
                ...formData,
                answerSubType: value,
                answer: "",
              };
              onChange(newData);
            }}
          >
            <SelectTrigger className="dark:bg-input/30 bg-transparent">
              <SelectValue placeholder="Select answer format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">String</SelectItem>
              <SelectItem value="photo">Photo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.answerType === "single_choice" && (
        <div className="space-y-2">
          <Label>Options</Label>
          {formData.options?.map((option, idx) => (
            <div
              key={`${idx}-${option.substring(0, 20)}`}
              className="space-y-1"
            >
              <div className="flex items-start space-x-2">
                {formData.answerSubType === "photo" ? (
                  <div className="flex-1">
                    {typeof option === "string" &&
                    option.trim().startsWith("data:image/") ? (
                      <div className="relative">
                        <img
                          src={option.trim()}
                          alt={`Option ${String.fromCharCode(65 + idx)}`}
                          className="w-full h-32 object-cover rounded-md border"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="absolute right-2 top-2 h-8 w-8"
                          onClick={(e) => {
                            e.preventDefault();
                            const newOptions = [...(formData.options || [])];
                            newOptions[idx] = "";
                            const optionLetter = String.fromCharCode(65 + idx);
                            const answerArray = formData.answer
                              ? formData.answer.split(",").map((a) => a.trim())
                              : [];
                            const newAnswer = answerArray
                              .filter((a) => a !== optionLetter)
                              .join(", ");
                            onChange({
                              ...formData,
                              options: newOptions,
                              answer: newAnswer,
                            });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-20 border-2 border-dashed flex-col"
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/*";
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement)
                                .files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const base64 = event.target?.result as string;
                                  const newOptions = [
                                    ...(formData.options || []),
                                  ];
                                  newOptions[idx] = base64;
                                  onChange({
                                    ...formData,
                                    options: newOptions,
                                  });
                                };
                                reader.readAsDataURL(file);
                              }
                            };
                            input.click();
                          }}
                        >
                          <Upload className="h-5 w-4 mb-1" />
                          <span className="text-xs">Choose Photo</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-20 border-2 border-dashed flex-col"
                          onClick={async () => {
                            try {
                              const clipboardItems =
                                await navigator.clipboard.read();
                              for (const clipboardItem of clipboardItems) {
                                for (const type of clipboardItem.types) {
                                  if (type.startsWith("image/")) {
                                    const blob =
                                      await clipboardItem.getType(type);
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const base64 = event.target
                                        ?.result as string;
                                      const newOptions = [
                                        ...(formData.options || []),
                                      ];
                                      newOptions[idx] = base64;
                                      onChange({
                                        ...formData,
                                        options: newOptions,
                                      });
                                    };
                                    reader.readAsDataURL(blob);
                                    return;
                                  }
                                }
                              }
                              alert("No image found in clipboard");
                            } catch (err) {
                              alert(
                                "Failed to read clipboard. Please paste the image directly or use the file chooser.",
                              );
                            }
                          }}
                        >
                          <Upload className="h-5 w-4 mb-1" />
                          <span className="text-xs">Paste Photo</span>
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Textarea
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(formData.options || [])];
                      newOptions[idx] = e.target.value;
                      onChange({
                        ...formData,
                        options: newOptions,
                      });
                    }}
                    className={`font-mono text-sm min-h-[60px] flex-1 ${
                      errors.options?.[idx] ? "border-destructive" : ""
                    }`}
                  />
                )}
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
                      const newAnswer = [...answerArray, optionLetter].join(
                        ", ",
                      );
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
                  <CheckIcon
                    className={`h-5 w-5 ${
                      formData.answer?.includes(String.fromCharCode(65 + idx))
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  />
                </Button>
              </div>
              {errors.options?.[idx] && (
                <p className="text-sm text-destructive">
                  {errors.options[idx]}
                </p>
              )}
            </div>
          ))}
          <div className="text-sm text-muted-foreground mt-2">
            {formData.answerSubType === "photo"
              ? "Upload photos for each option and click the checkmark to select the correct answer"
              : "Click the checkmark next to each option to select it as an answer"}
          </div>
          {errors.answer && (
            <p className="text-sm text-destructive">{errors.answer}</p>
          )}
        </div>
      )}

      {formData.answerType === "string" && (
        <div className="space-y-2">
          <Label htmlFor="stringAnswer">
            Answer <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="stringAnswer"
            placeholder="Enter the answer..."
            value={formData.answer}
            onChange={(e) =>
              onChange({
                ...formData,
                answer: e.target.value,
              })
            }
            className={`min-h-[80px] font-mono text-sm ${
              errors.answer ? "border-destructive" : ""
            }`}
            required
          />
          {errors.answer && (
            <p className="text-sm text-destructive">{errors.answer}</p>
          )}
        </div>
      )}

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

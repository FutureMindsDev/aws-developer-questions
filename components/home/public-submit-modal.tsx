"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, CheckIcon } from "lucide-react";

interface SubmitFormData {
  question: string;
  questionImages: string[];
  options: string[];
  answer: string;
  explanation: string;
  number: string;
  linkUrl: string;
}

interface SubmitErrors {
  question: string;
  options: string[];
  answer: string;
  number: string;
  linkUrl: string;
}

interface PublicSubmitModalProps {
  show: boolean;
  submitting: boolean;
  submitFormData: SubmitFormData;
  submitErrors: SubmitErrors;
  onClose: () => void;
  onChange: (data: SubmitFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function PublicSubmitModal({
  show,
  submitting,
  submitFormData,
  submitErrors,
  onClose,
  onChange,
  onSubmit,
}: PublicSubmitModalProps) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center px-4"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "gray transparent",
        scrollbarGutter: "stable",
      }}
      onClick={onClose}
    >
      <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <Card className="flex flex-col h-[90dvh]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Submit a new question</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                This question will be reviewed by an admin before it appears on
                the site.
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <div className="mb-4 rounded-md bg-muted p-3 text-sm text-muted-foreground">
              Submissions are subject to admin approval. Only approved questions
              will be visible on the public site.
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="public-number">Number</Label>
                <Input
                  id="public-number"
                  type="number"
                  placeholder="Question number (for sorting)"
                  value={submitFormData.number}
                  onChange={(e) =>
                    onChange({
                      ...submitFormData,
                      number: e.target.value,
                    })
                  }
                  className={`font-mono text-sm ${
                    submitErrors.number ? "border-destructive" : ""
                  }`}
                />
                {submitErrors.number && (
                  <p className="text-sm text-destructive">
                    {submitErrors.number}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="public-question">
                  Question <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="public-question"
                  placeholder="Enter the question..."
                  value={submitFormData.question}
                  onChange={(e) =>
                    onChange({
                      ...submitFormData,
                      question: e.target.value,
                    })
                  }
                  className={`min-h-[100px] font-mono text-sm ${
                    submitErrors.question ? "border-destructive" : ""
                  }`}
                  required
                />
                {submitErrors.question && (
                  <p className="text-sm text-destructive">
                    {submitErrors.question}
                  </p>
                )}

                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const base64 = event.target?.result as string;
                          const current = submitFormData.questionImages || [];
                          onChange({
                            ...submitFormData,
                            questionImages: [...current, base64],
                          });
                        };
                        reader.readAsDataURL(file);
                      };
                      input.click();
                    }}
                  >
                    + Add a photo
                  </Button>

                  {(submitFormData.questionImages?.length || 0) > 0 && (
                    <div className="grid grid-cols-1 gap-2">
                      {(submitFormData.questionImages || []).map((img, idx) => (
                        <div
                          key={`${idx}-${img.substring(0, 20)}`}
                          className="relative"
                        >
                          <img
                            src={img.trim()}
                            alt={`Question photo ${idx + 1}`}
                            className="w-full h-40 object-cover rounded-md border"
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="absolute right-2 top-2 h-8 w-8"
                            onClick={(e) => {
                              e.preventDefault();
                              const current =
                                submitFormData.questionImages || [];
                              const next = current.filter((_, i) => i !== idx);
                              onChange({
                                ...submitFormData,
                                questionImages: next,
                              });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="public-linkUrl">
                  Source link <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="public-linkUrl"
                  type="url"
                  placeholder="https://example.com/where-you-found-this-question"
                  value={submitFormData.linkUrl}
                  onChange={(e) =>
                    onChange({
                      ...submitFormData,
                      linkUrl: e.target.value,
                    })
                  }
                  className={submitErrors.linkUrl ? "border-destructive" : ""}
                  required
                />
                {submitErrors.linkUrl && (
                  <p className="text-sm text-destructive">
                    {submitErrors.linkUrl}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Options</Label>
                {submitFormData.options.map((option, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-start space-x-2">
                      <Textarea
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...submitFormData.options];
                          newOptions[idx] = e.target.value;
                          onChange({
                            ...submitFormData,
                            options: newOptions,
                          });
                        }}
                        className={`font-mono text-sm min-h-[60px] flex-1 ${
                          submitErrors.options[idx] ? "border-destructive" : ""
                        }`}
                      />
                      <Button
                        variant={
                          submitFormData.answer?.includes(
                            String.fromCharCode(65 + idx),
                          )
                            ? "default"
                            : "outline"
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          const answerArray = submitFormData.answer
                            ? submitFormData.answer
                                .split(",")
                                .map((a) => a.trim())
                            : [];
                          const optionLetter = String.fromCharCode(65 + idx);

                          if (answerArray.includes(optionLetter)) {
                            const newAnswer = answerArray
                              .filter((a) => a !== optionLetter)
                              .join(", ");
                            onChange({
                              ...submitFormData,
                              answer: newAnswer,
                            });
                          } else {
                            const newAnswer = [
                              ...answerArray,
                              optionLetter,
                            ].join(", ");
                            onChange({
                              ...submitFormData,
                              answer: newAnswer,
                            });
                          }
                        }}
                        className={`h-10 w-10 rounded-md border flex items-center justify-center ${
                          submitFormData.answer?.includes(
                            String.fromCharCode(65 + idx),
                          )
                            ? "text-primary-foreground"
                            : "border-input"
                        }`}
                      >
                        {submitFormData.answer?.includes(
                          String.fromCharCode(65 + idx),
                        ) && <CheckIcon className="h-5 w-5" />}
                      </Button>
                    </div>
                    {submitErrors.options[idx] && (
                      <p className="text-sm text-destructive">
                        {submitErrors.options[idx]}
                      </p>
                    )}
                  </div>
                ))}
                <div className="text-sm text-muted-foreground mt-2">
                  Click the checkmark next to each option to select it as an
                  answer
                </div>
                {submitErrors.answer && (
                  <p className="text-sm text-destructive">
                    {submitErrors.answer}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="public-explanation">
                  Explanation (Optional)
                </Label>
                <Textarea
                  id="public-explanation"
                  placeholder="Explain the answer..."
                  value={submitFormData.explanation}
                  onChange={(e) =>
                    onChange({
                      ...submitFormData,
                      explanation: e.target.value,
                    })
                  }
                  className="min-h-[100px] text-sm font-mono"
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit for approval"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

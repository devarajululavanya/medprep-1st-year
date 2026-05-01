import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMarkQuestionFlagged,
  useQuestions,
  useSubjects,
  useTopics,
} from "@/hooks/useBackend";
import type { Question } from "@/types";
import { SUBJECT_META } from "@/types";
import type { SubjectName } from "@/types";
import { Link, useParams } from "@tanstack/react-router";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Flag,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

// ─── Filter types ─────────────────────────────────────────────────────────────

type FilterMode = "all" | "flagged" | "answered" | "unanswered";

const FILTERS: { key: FilterMode; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unanswered", label: "Unanswered" },
  { key: "answered", label: "Answered" },
  { key: "flagged", label: "Flagged" },
];

// ─── Skeleton card ─────────────────────────────────────────────────────────────

function QuestionSkeleton() {
  return (
    <Card className="border border-border bg-card shadow-subtle">
      <CardContent className="p-5 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="space-y-2 pt-1">
          {(["A", "B", "C", "D"] as const).map((letter) => (
            <Skeleton key={letter} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Individual question card ─────────────────────────────────────────────────

function QuestionCard({
  question,
  index,
  onAnswered,
  isAnswered,
  answeredIndex,
}: {
  question: Question;
  index: number;
  onAnswered: (questionId: bigint, selectedIndex: number) => void;
  isAnswered: boolean;
  answeredIndex: number | null;
}) {
  const [revealed, setRevealed] = useState(false);
  const { mutate: flagQuestion, isPending: flagging } =
    useMarkQuestionFlagged();

  const correct = Number(question.correctIndex);
  const showResult = isAnswered || revealed;

  function getOptionClass(i: number): string {
    const base =
      "w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-2.5 border transition-all duration-300";
    if (!showResult) {
      const isSelected = answeredIndex === i;
      return `${base} ${
        isSelected
          ? "border-primary bg-primary/5 text-primary"
          : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/3 cursor-pointer"
      }`;
    }
    if (i === correct)
      return `${base} border-green-500 bg-green-50 text-green-800`;
    if (i === answeredIndex && i !== correct)
      return `${base} border-destructive bg-red-50 text-red-700`;
    return `${base} border-border bg-background text-muted-foreground`;
  }

  return (
    <Card
      data-ocid={`questions.item.${index}`}
      className="border border-border bg-card shadow-subtle overflow-hidden"
    >
      <CardContent className="p-5">
        {/* Question header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
              {index}
            </span>
            <p className="text-foreground text-sm font-medium leading-relaxed">
              {question.text}
            </p>
          </div>
          <button
            type="button"
            onClick={() => flagQuestion(question.id)}
            disabled={flagging}
            data-ocid={`questions.flag.${index}`}
            className={`p-1.5 rounded-lg transition-smooth flex-shrink-0 ${
              question.isFlagged
                ? "text-secondary bg-secondary/10"
                : "text-muted-foreground hover:text-secondary hover:bg-secondary/10"
            }`}
            aria-label={question.isFlagged ? "Remove flag" : "Flag question"}
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-2 mb-4">
          {question.options.map((opt, i) => (
            <button
              key={`opt-${question.id.toString()}-${i}`}
              type="button"
              onClick={() => !showResult && onAnswered(question.id, i)}
              disabled={showResult}
              data-ocid={`questions.option.${index}.${i + 1}`}
              className={getOptionClass(i)}
            >
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs flex-shrink-0 font-mono font-semibold">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1 text-left">{opt}</span>
              {showResult && i === correct && (
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              )}
              {isAnswered && answeredIndex === i && i !== correct && (
                <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Explanation (animated reveal) */}
        <div
          className={`transition-all duration-400 ease-in-out overflow-hidden ${
            showResult ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-muted/40 border border-border rounded-lg p-3 mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Explanation
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {question.explanation}
            </p>
          </div>
        </div>

        {/* Actions */}
        {!showResult && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRevealed(true)}
              data-ocid={`questions.reveal.${index}`}
              className="text-xs"
            >
              Reveal Answer
            </Button>
          </div>
        )}

        {showResult && (
          <div className="flex items-center gap-1.5">
            {isAnswered && answeredIndex === correct ? (
              <Badge
                variant="outline"
                className="text-green-700 border-green-300 bg-green-50 text-xs"
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Correct
              </Badge>
            ) : isAnswered ? (
              <Badge
                variant="outline"
                className="text-destructive border-destructive/30 bg-red-50 text-xs"
              >
                <XCircle className="w-3 h-3 mr-1" />
                Incorrect
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                Answer revealed
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QuestionBankPage() {
  const params = useParams({ strict: false });
  const topicId = BigInt((params as Record<string, string>).topicId ?? "1");

  const { data: questions, isLoading } = useQuestions(topicId);
  const { data: subjects } = useSubjects();
  const anatTopics = useTopics(1n).data ?? [];
  const physTopics = useTopics(2n).data ?? [];
  const biochemTopics = useTopics(3n).data ?? [];
  const allTopics = [...anatTopics, ...physTopics, ...biochemTopics];

  const topic = allTopics.find((t) => t.id === topicId);
  const subject = subjects?.find((s) => s.id === topic?.subjectId);
  const meta = subject ? SUBJECT_META[subject.name as SubjectName] : null;

  // answered state: map from questionId string → selected index
  const [answeredMap, setAnsweredMap] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<FilterMode>("all");

  function handleAnswered(questionId: bigint, selectedIndex: number) {
    setAnsweredMap((prev) => ({
      ...prev,
      [questionId.toString()]: selectedIndex,
    }));
  }

  const filteredQuestions = useMemo(() => {
    if (!questions) return [];
    return questions.filter((q) => {
      const isAnswered = q.id.toString() in answeredMap;
      if (filter === "answered") return isAnswered;
      if (filter === "unanswered") return !isAnswered;
      if (filter === "flagged") return q.isFlagged;
      return true;
    });
  }, [questions, filter, answeredMap]);

  const answeredCount = useMemo(
    () =>
      (questions ?? []).filter((q) => q.id.toString() in answeredMap).length,
    [questions, answeredMap],
  );
  const flaggedCount = useMemo(
    () => (questions ?? []).filter((q) => q.isFlagged).length,
    [questions],
  );

  return (
    <Layout
      title="Question Bank"
      subtitle={topic?.title}
      actions={
        <Link
          to="/topics/$topicId"
          params={{ topicId: topicId.toString() }}
          data-ocid="questions.back.link"
        >
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      }
    >
      <div className="max-w-2xl">
        {/* Topic banner */}
        {topic && (
          <div className="flex items-center justify-between mb-5 bg-card border border-border rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg">{meta?.icon}</span>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">
                  {topic.title}
                </p>
                <p className="text-xs text-muted-foreground">{meta?.label}</p>
              </div>
            </div>
            <Link
              to="/quiz/$topicId/$count"
              params={{ topicId: topicId.toString(), count: "5" }}
              data-ocid="questions.start_quiz.button"
            >
              <Button size="sm" className="gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Start Quiz
              </Button>
            </Link>
          </div>
        )}

        {/* Stats row */}
        {!isLoading && questions && questions.length > 0 && (
          <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
            <span>
              <strong className="text-foreground">{questions.length}</strong>{" "}
              questions
            </span>
            <span className="text-border">•</span>
            <span>
              <strong className="text-green-600">{answeredCount}</strong>{" "}
              answered
            </span>
            {flaggedCount > 0 && (
              <>
                <span className="text-border">•</span>
                <span>
                  <strong className="text-secondary">{flaggedCount}</strong>{" "}
                  flagged
                </span>
              </>
            )}
          </div>
        )}

        {/* Filter tabs */}
        <div
          className="flex items-center gap-1 bg-muted/40 border border-border rounded-xl p-1 mb-5"
          data-ocid="questions.filter.tab"
          role="tablist"
          aria-label="Filter questions"
        >
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              data-ocid={`questions.filter.${f.key}`}
              className={`flex-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-smooth ${
                filter === f.key
                  ? "bg-card text-foreground shadow-subtle"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
              {f.key === "flagged" && flaggedCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-secondary/20 text-secondary text-[10px] font-bold">
                  {flaggedCount}
                </span>
              )}
              {f.key === "answered" && answeredCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
                  {answeredCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Question list */}
        <div className="space-y-4" data-ocid="questions.list">
          {isLoading ? (
            (["q1", "q2", "q3"] as const).map((k) => (
              <QuestionSkeleton key={k} />
            ))
          ) : filteredQuestions.length === 0 ? (
            <div
              className="text-center py-16 text-muted-foreground bg-card border border-border rounded-xl"
              data-ocid="questions.empty_state"
            >
              <div className="text-4xl mb-3">
                {filter === "flagged"
                  ? "🚩"
                  : filter === "answered"
                    ? "✅"
                    : "📋"}
              </div>
              <p className="text-base font-display font-semibold mb-1">
                {filter === "flagged"
                  ? "No flagged questions"
                  : filter === "answered"
                    ? "No answered questions yet"
                    : filter === "unanswered"
                      ? "All questions answered!"
                      : "No questions yet"}
              </p>
              <p className="text-sm max-w-64 mx-auto">
                {filter === "all"
                  ? "Questions will appear here once they are generated for this topic."
                  : filter === "flagged"
                    ? "Flag questions by clicking the flag icon on any question."
                    : filter === "answered"
                      ? "Answer questions by selecting an option or revealing the answer."
                      : "Great job! You've answered all questions in this topic."}
              </p>
              {filter !== "all" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setFilter("all")}
                  data-ocid="questions.show_all.button"
                >
                  Show all questions
                </Button>
              )}
            </div>
          ) : (
            filteredQuestions.map((q, i) => (
              <QuestionCard
                key={q.id.toString()}
                question={q}
                index={i + 1}
                onAnswered={handleAnswered}
                isAnswered={q.id.toString() in answeredMap}
                answeredIndex={answeredMap[q.id.toString()] ?? null}
              />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

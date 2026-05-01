import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubjects, useTopics } from "@/hooks/useBackend";
import { SUBJECT_META } from "@/types";
import type { SubjectName } from "@/types";
import { Link, useParams } from "@tanstack/react-router";
import {
  BookOpen,
  Brain,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  Stethoscope,
} from "lucide-react";

const ACTION_CARDS = [
  {
    key: "questions",
    label: "Question Bank",
    description: "MCQs with detailed explanations",
    icon: FileQuestion,
    color: "bg-primary/10 text-primary",
    border: "hover:border-primary/40",
    route: "questions" as const,
  },
  {
    key: "flashcards",
    label: "Flashcards",
    description: "Spaced-repetition review cards",
    icon: Brain,
    color: "bg-secondary/15 text-secondary",
    border: "hover:border-secondary/40",
    route: "flashcards" as const,
  },
  {
    key: "quiz",
    label: "Timed Quiz",
    description: "5, 10 or 20-question practice test",
    icon: BookOpen,
    color: "bg-teal-100 text-teal-700",
    border: "hover:border-teal-300",
    route: "quiz" as const,
  },
  {
    key: "cases",
    label: "ECE Cases",
    description: "Real clinical scenarios",
    icon: Stethoscope,
    color: "bg-purple-100 text-purple-700",
    border: "hover:border-purple-300",
    route: "cases" as const,
  },
];

export default function TopicDetailPage() {
  const params = useParams({ strict: false });
  const topicId = BigInt((params as Record<string, string>).topicId ?? "1");

  const { data: subjects, isLoading: subjectsLoading } = useSubjects();
  const anatTopics = useTopics(1n).data ?? [];
  const physTopics = useTopics(2n).data ?? [];
  const biochemTopics = useTopics(3n).data ?? [];
  const allTopicsFlat = [...anatTopics, ...physTopics, ...biochemTopics];

  const topic = allTopicsFlat.find((t) => t.id === topicId);
  const subject = subjects?.find((s) => s.id === topic?.subjectId);
  const meta = subject ? SUBJECT_META[subject.name as SubjectName] : null;

  const isLoading = subjectsLoading && !topic;

  return (
    <Layout
      title={topic?.title ?? "Topic"}
      subtitle={meta?.label}
      actions={
        <Link
          to="/subjects/$subjectId"
          params={{ subjectId: (topic?.subjectId ?? 1n).toString() }}
          data-ocid="topic.back.link"
        >
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="w-4 h-4" />
            <span>{meta?.label ?? "Back"}</span>
          </Button>
        </Link>
      }
    >
      <div className="max-w-3xl space-y-6">
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-1.5 text-sm text-muted-foreground"
          aria-label="Breadcrumb"
        >
          <Link
            to="/subjects"
            className="hover:text-foreground transition-colors"
          >
            Subjects
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          {subject ? (
            <Link
              to="/subjects/$subjectId"
              params={{ subjectId: subject.id.toString() }}
              className="hover:text-foreground transition-colors"
            >
              {meta?.label}
            </Link>
          ) : (
            <Skeleton className="w-20 h-4" />
          )}
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          {topic ? (
            <span className="text-foreground font-medium truncate">
              {topic.title}
            </span>
          ) : (
            <Skeleton className="w-32 h-4" />
          )}
        </nav>

        {/* Topic header */}
        {isLoading ? (
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : topic ? (
          <div
            className="rounded-xl border border-border bg-card p-6"
            data-ocid="topic.detail.card"
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl ${
                  meta?.color === "text-blue-600"
                    ? "bg-blue-50"
                    : meta?.color === "text-teal-600"
                      ? "bg-teal-50"
                      : "bg-orange-50"
                }`}
              >
                {meta?.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <h2 className="text-xl font-display font-bold text-foreground">
                    {topic.title}
                  </h2>
                  <Badge variant="outline" className="text-xs">
                    {meta?.label}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Topic {topic.orderIndex.toString()}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {topic.description}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="rounded-xl border border-border bg-muted/40 p-6 text-center text-muted-foreground"
            data-ocid="topic.empty_state"
          >
            Topic not found.
          </div>
        )}

        {/* Action cards */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Study Options
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ACTION_CARDS.map((card) => {
              const Icon = card.icon;
              const toLink =
                card.route === "questions"
                  ? `/questions/${topicId.toString()}`
                  : card.route === "flashcards"
                    ? `/flashcards/${topicId.toString()}`
                    : card.route === "quiz"
                      ? `/quiz/${topicId.toString()}/5`
                      : "/cases";

              return (
                <Link
                  key={card.key}
                  to={toLink as "/cases"}
                  data-ocid={`topic.${card.key}.button`}
                >
                  <Card
                    className={`border border-border bg-card hover:shadow-elevated transition-smooth cursor-pointer h-full ${card.border}`}
                  >
                    <CardContent className="p-5 flex items-center gap-4">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">
                          {card.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {card.description}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Questions", value: "5+", color: "text-primary" },
            { label: "Flashcards", value: "6+", color: "text-secondary" },
            { label: "Quiz Modes", value: "3", color: "text-teal-600" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-muted/40 p-4 text-center"
              data-ocid={`topic.stat.${stat.label.toLowerCase()}`}
            >
              <p className={`text-2xl font-display font-bold ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

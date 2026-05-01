import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubjects, useTopics, useUserProgress } from "@/hooks/useBackend";
import { SUBJECT_META } from "@/types";
import type { SubjectName } from "@/types";
import { Link, useParams } from "@tanstack/react-router";
import {
  BookOpen,
  Brain,
  ChevronLeft,
  ClipboardList,
  FileQuestion,
  Stethoscope,
} from "lucide-react";

// ─── Topic mastery badge ──────────────────────────────────────────────────────

function MasteryBadge({ level }: { level: "new" | "learning" | "mastered" }) {
  const config = {
    new: {
      label: "New",
      classes: "bg-muted text-muted-foreground border-border",
    },
    learning: {
      label: "In Progress",
      classes: "bg-orange-50 text-orange-700 border-orange-200",
    },
    mastered: {
      label: "Mastered",
      classes: "bg-teal-50 text-teal-700 border-teal-200",
    },
  };
  const { label, classes } = config[level];
  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-medium px-2 py-0.5 flex-shrink-0 ${classes}`}
    >
      {label}
    </Badge>
  );
}

// ─── Topic action buttons ─────────────────────────────────────────────────────

function TopicActions({
  topicId,
  idx,
}: {
  topicId: string;
  idx: number;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Link
        to="/questions/$topicId"
        params={{ topicId }}
        data-ocid={`subject.topic.questions.${idx}`}
      >
        <Button size="sm" variant="outline" className="h-7 text-xs px-2 gap-1">
          <BookOpen className="w-3 h-3" />
          Study Qs
        </Button>
      </Link>
      <Link
        to="/flashcards/$topicId"
        params={{ topicId }}
        data-ocid={`subject.topic.flashcards.${idx}`}
      >
        <Button size="sm" variant="outline" className="h-7 text-xs px-2 gap-1">
          <Brain className="w-3 h-3" />
          Flashcards
        </Button>
      </Link>
      <Link
        to="/quiz/$topicId/$count"
        params={{ topicId, count: "10" }}
        data-ocid={`subject.topic.quiz.${idx}`}
      >
        <Button size="sm" variant="outline" className="h-7 text-xs px-2 gap-1">
          <FileQuestion className="w-3 h-3" />
          Quiz
        </Button>
      </Link>
      <Link to="/cases" data-ocid={`subject.topic.ece.${idx}`}>
        <Button size="sm" variant="outline" className="h-7 text-xs px-2 gap-1">
          <Stethoscope className="w-3 h-3" />
          ECE
        </Button>
      </Link>
    </div>
  );
}

// ─── Topic row skeleton ───────────────────────────────────────────────────────

function TopicRowSkeleton() {
  return (
    <Card className="border border-border bg-card shadow-subtle">
      <CardContent className="p-4 flex items-start gap-3">
        <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-3 w-full" />
          <div className="flex gap-1.5">
            {(["study", "flash", "quiz", "ece"] as const).map((sk) => (
              <Skeleton key={sk} className="h-7 w-20 rounded-md" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubjectDetailPage() {
  const params = useParams({ strict: false });
  const subjectId = BigInt((params as Record<string, string>).subjectId ?? "1");

  const { data: subjects } = useSubjects();
  const { data: topics, isLoading } = useTopics(subjectId);
  const { data: progress } = useUserProgress();

  const subject = subjects?.find((s) => s.id === subjectId);
  const meta = subject ? SUBJECT_META[subject.name as SubjectName] : null;
  const sp = progress?.subjectProgress.find((s) => s.subjectId === subjectId);

  // Determine per-topic mastery level based on index relative to topicsStudied
  const topicsStudied = Number(sp?.topicsStudied ?? 0);

  const getMasteryLevel = (
    topicIdx: number,
  ): "new" | "learning" | "mastered" => {
    if (topicIdx < topicsStudied - 1) return "mastered";
    if (topicIdx === topicsStudied - 1) return "learning";
    return "new";
  };

  return (
    <Layout
      title={meta?.label ?? "Subject"}
      subtitle={subject?.description}
      actions={
        <Link to="/subjects" data-ocid="subject.back.link">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="w-4 h-4 mr-1" /> All Subjects
          </Button>
        </Link>
      }
    >
      {/* Subject overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          {
            label: "Total Topics",
            value: subject?.topicCount?.toString() ?? "0",
            icon: ClipboardList,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "Studied",
            value: sp?.topicsStudied?.toString() ?? "0",
            icon: BookOpen,
            color: "text-teal-600",
            bg: "bg-teal-50",
          },
          {
            label: "Quizzes",
            value: sp?.quizzesTaken?.toString() ?? "0",
            icon: FileQuestion,
            color: "text-orange-600",
            bg: "bg-orange-50",
          },
          {
            label: "Flashcards",
            value: sp?.flashcardsReviewed?.toString() ?? "0",
            icon: Brain,
            color: "text-primary",
            bg: "bg-primary/10",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="border border-border bg-card shadow-subtle"
          >
            <CardContent className="p-3 flex flex-col items-center text-center">
              <div
                className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}
              >
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-xl font-display font-bold text-foreground">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Topics list */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-foreground">Topics</h2>
        <Badge variant="outline">{topics?.length ?? 0} total</Badge>
      </div>

      <div className="space-y-3" data-ocid="subject.topics.list">
        {isLoading
          ? (["t1", "t2", "t3", "t4", "t5"] as const).map((sk) => (
              <TopicRowSkeleton key={sk} />
            ))
          : (topics ?? []).map((topic, i) => {
              const masteryLevel = getMasteryLevel(i);
              return (
                <Card
                  key={topic.id.toString()}
                  data-ocid={`subject.topic.item.${i + 1}`}
                  className="border border-border bg-card shadow-subtle hover:shadow-elevated transition-smooth"
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    {/* Index badge */}
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-medium text-foreground text-sm leading-snug truncate">
                          {topic.title}
                        </h3>
                        <MasteryBadge level={masteryLevel} />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {topic.description}
                      </p>
                      <TopicActions topicId={topic.id.toString()} idx={i + 1} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Subject-level quick actions */}
      <div className="mt-8 p-4 rounded-xl bg-muted/40 border border-border flex flex-wrap items-center gap-3">
        <p className="text-sm font-medium text-foreground mr-auto">
          Jump into a full subject session:
        </p>
        <Link
          to="/quiz/$topicId/$count"
          params={{ topicId: subjectId.toString(), count: "10" }}
          data-ocid="subject.quick_quiz.button"
        >
          <Button variant="default" size="sm">
            <FileQuestion className="w-4 h-4 mr-2" /> Quick Quiz (10 Qs)
          </Button>
        </Link>
        <Link to="/flashcards" data-ocid="subject.flashcards.button">
          <Button variant="outline" size="sm">
            <Brain className="w-4 h-4 mr-2" /> Flashcard Review
          </Button>
        </Link>
        <Link to="/cases" data-ocid="subject.ece.button">
          <Button variant="outline" size="sm">
            <Stethoscope className="w-4 h-4 mr-2" /> ECE Cases
          </Button>
        </Link>
      </div>
    </Layout>
  );
}

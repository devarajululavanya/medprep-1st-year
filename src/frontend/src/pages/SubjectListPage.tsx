import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubjects, useUserProgress } from "@/hooks/useBackend";
import { SUBJECT_BG, SUBJECT_META } from "@/types";
import type { SubjectName } from "@/types";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen } from "lucide-react";

function SubjectCardSkeleton() {
  return (
    <Card className="border border-border bg-card shadow-subtle">
      <CardContent className="p-5 flex items-center gap-5">
        <Skeleton className="w-14 h-14 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <div className="flex items-center gap-3 mt-1">
            <Skeleton className="h-2 flex-1 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="w-20 h-8 rounded-md flex-shrink-0" />
      </CardContent>
    </Card>
  );
}

export default function SubjectListPage() {
  const { data: subjects, isLoading } = useSubjects();
  const { data: progress } = useUserProgress();

  const progressMap = new Map(
    progress?.subjectProgress.map((sp) => [sp.subjectId.toString(), sp]) ?? [],
  );

  return (
    <Layout title="Subjects" subtitle="MBBS 1st Year — Core Subjects">
      <div className="max-w-3xl">
        <p className="text-muted-foreground mb-6 text-sm">
          Choose a subject to browse topics, take quizzes, and review
          flashcards.
        </p>

        <div className="space-y-4" data-ocid="subjects.list">
          {isLoading
            ? (["anatomy", "physiology", "biochemistry"] as const).map((sk) => (
                <SubjectCardSkeleton key={sk} />
              ))
            : (subjects ?? []).map((subject, i) => {
                const meta = SUBJECT_META[subject.name as SubjectName];
                const bg = SUBJECT_BG[subject.name as SubjectName];
                const sp = progressMap.get(subject.id.toString());
                const mastery = sp?.masteryPercent ?? 0;
                const topicsStudied = Number(sp?.topicsStudied ?? 0);
                const totalTopics = Number(subject.topicCount);

                return (
                  <Card
                    key={subject.id.toString()}
                    data-ocid={`subjects.item.${i + 1}`}
                    className={`border ${bg} shadow-subtle hover:shadow-elevated transition-smooth`}
                  >
                    <CardContent className="p-5 flex items-center gap-5">
                      {/* Icon */}
                      <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-2xl flex-shrink-0 shadow-subtle">
                        {meta.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h2 className="font-display font-semibold text-foreground text-lg">
                            {meta.label}
                          </h2>
                          <Badge
                            variant="outline"
                            className="text-xs flex-shrink-0"
                          >
                            <BookOpen className="w-3 h-3 mr-1" />
                            {subject.topicCount.toString()} topics
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {subject.description}
                        </p>

                        {/* Mastery progress bar */}
                        <div className="flex items-center gap-3">
                          <Progress value={mastery} className="flex-1 h-2" />
                          <span className="text-xs text-muted-foreground flex-shrink-0 w-28 text-right">
                            {mastery}% mastered
                            {totalTopics > 0
                              ? ` · ${topicsStudied}/${totalTopics} topics`
                              : ""}
                          </span>
                        </div>
                      </div>

                      {/* Action */}
                      <Link
                        to="/subjects/$subjectId"
                        params={{ subjectId: subject.id.toString() }}
                        data-ocid={`subjects.open.${i + 1}`}
                        className="flex-shrink-0"
                      >
                        <Button size="sm" variant="default">
                          Open <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
        </div>
      </div>
    </Layout>
  );
}

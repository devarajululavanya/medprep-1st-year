import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDueFlashcards,
  useQuizHistory,
  useSubjects,
  useUserProgress,
} from "@/hooks/useBackend";
import { SUBJECT_META } from "@/types";
import type { SubjectName } from "@/types";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock,
  Flame,
  Stethoscope,
  TrendingUp,
  XCircle,
} from "lucide-react";

// ─── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({
  percent,
  size = 88,
  stroke = 8,
  colorClass = "stroke-primary",
}: {
  percent: number;
  size?: number;
  stroke?: number;
  colorClass?: string;
}) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg
      width={size}
      height={size}
      className="-rotate-90"
      role="img"
      aria-label={`${percent}% mastery`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        className="stroke-muted"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        className={colorClass}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
    </svg>
  );
}

// ─── Skeleton cards ───────────────────────────────────────────────────────────

function SubjectCardSkeleton() {
  return (
    <Card className="border border-border bg-card shadow-subtle">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="w-[88px] h-[88px] rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const RING_COLORS = ["stroke-primary", "stroke-teal-500", "stroke-orange-500"];
const ICON_COLORS = ["text-primary", "text-teal-600", "text-orange-500"];
const ICON_BG = ["bg-primary/10", "bg-teal-50", "bg-orange-50"];

export default function DashboardPage() {
  const { data: subjects, isLoading: subjectsLoading } = useSubjects();
  const { data: progress, isLoading: progressLoading } = useUserProgress();
  const { data: dueFlashcards } = useDueFlashcards();
  const { data: quizHistory } = useQuizHistory();

  const isLoading = subjectsLoading || progressLoading;

  const streak = Number(progress?.streakDays ?? 0);
  const totalMinutes = Number(progress?.totalStudyMinutes ?? 0);
  const dueCount = dueFlashcards?.length ?? 0;
  const subjectProgressMap = new Map(
    progress?.subjectProgress.map((sp) => [sp.subjectId.toString(), sp]) ?? [],
  );

  // Recent quiz history (last 5)
  const recentQuizzes = (quizHistory ?? []).slice(0, 5);

  const statsData = [
    {
      label: "Study Time",
      value: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
      icon: Clock,
      idx: 0,
    },
    {
      label: "Due Cards",
      value: String(dueCount),
      icon: Brain,
      idx: 1,
    },
    {
      label: "Quizzes Taken",
      value: String(quizHistory?.length ?? 0),
      icon: TrendingUp,
      idx: 2,
    },
    {
      label: "Study Streak",
      value: `${streak} days`,
      icon: Flame,
      idx: 2,
    },
  ];

  return (
    <Layout
      title="Dashboard"
      subtitle="Welcome back — keep up the great work!"
      actions={
        streak > 0 ? (
          <Badge
            data-ocid="dashboard.streak.badge"
            className="bg-orange-50 text-orange-700 border border-orange-200 gap-1 font-medium px-3 py-1"
          >
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            {streak} day streak 🔥
          </Badge>
        ) : undefined
      }
    >
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {isLoading
          ? (["time", "cards", "quizzes", "streak"] as const).map((sk) => (
              <Card
                key={sk}
                className="border border-border bg-card shadow-subtle"
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))
          : statsData.map((stat) => (
              <Card
                key={stat.label}
                className="border border-border bg-card shadow-subtle"
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg ${ICON_BG[stat.idx]} flex items-center justify-center flex-shrink-0`}
                  >
                    <stat.icon className={`w-4 h-4 ${ICON_COLORS[stat.idx]}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-base font-display font-semibold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Subject progress + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Subject progress cards — spans 2 cols on lg */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-display font-semibold text-foreground mb-3">
            Subject Progress
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {isLoading
              ? (["anatomy", "physiology", "biochemistry"] as const).map(
                  (sk) => <SubjectCardSkeleton key={sk} />,
                )
              : (subjects ?? []).map((subject, i) => {
                  const meta = SUBJECT_META[subject.name as SubjectName];
                  const sp = subjectProgressMap.get(subject.id.toString());
                  const mastery = sp?.masteryPercent ?? 0;
                  const topicsStudied = Number(sp?.topicsStudied ?? 0);
                  const totalTopics = Number(subject.topicCount);

                  return (
                    <Card
                      key={subject.id.toString()}
                      data-ocid={`dashboard.subject.item.${i + 1}`}
                      className="border border-border bg-card shadow-subtle hover:shadow-elevated transition-smooth"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xl">{meta.icon}</span>
                          <h3 className="font-display font-semibold text-foreground text-sm">
                            {meta.label}
                          </h3>
                        </div>

                        {/* Progress ring */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="relative flex-shrink-0">
                            <ProgressRing
                              percent={mastery}
                              colorClass={RING_COLORS[i % 3]}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-bold text-foreground">
                                {mastery}%
                              </span>
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">
                              Topics
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                              {topicsStudied}/{totalTopics}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Quizzes
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                              {sp?.quizzesTaken?.toString() ?? "0"}
                            </p>
                          </div>
                        </div>

                        <Link
                          to="/subjects/$subjectId"
                          params={{ subjectId: subject.id.toString() }}
                          data-ocid={`dashboard.subject.continue.${i + 1}`}
                        >
                          <Button
                            size="sm"
                            className="w-full font-medium"
                            variant="default"
                          >
                            Continue <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
          </div>
        </div>

        {/* Right column: due flashcards + recent quiz scores */}
        <div className="space-y-4">
          {/* Due flashcards */}
          <Card className="border border-border bg-card shadow-subtle">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-display flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  Due Flashcards
                </span>
                {dueCount > 0 && (
                  <Badge
                    data-ocid="dashboard.due_cards.badge"
                    className="bg-orange-50 text-orange-700 border border-orange-200 text-xs"
                  >
                    {dueCount} due
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {isLoading ? (
                <div className="space-y-2">
                  {(["fc1", "fc2", "fc3"] as const).map((sk) => (
                    <Skeleton key={sk} className="h-10 w-full" />
                  ))}
                </div>
              ) : dueCount === 0 ? (
                <div
                  data-ocid="dashboard.due_cards.empty_state"
                  className="text-center py-4"
                >
                  <CheckCircle2 className="w-8 h-8 text-teal-500 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">
                    All caught up!
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-3">
                    {(dueFlashcards ?? []).slice(0, 3).map((card, i) => (
                      <div
                        key={card.id.toString()}
                        data-ocid={`dashboard.due_card.item.${i + 1}`}
                        className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2 line-clamp-1"
                      >
                        {card.front}
                      </div>
                    ))}
                  </div>
                  <Link
                    to="/flashcards"
                    data-ocid="dashboard.review_all.button"
                  >
                    <Button size="sm" variant="default" className="w-full">
                      Review All {dueCount} Cards
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent quiz scores */}
          <Card className="border border-border bg-card shadow-subtle">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Recent Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {isLoading ? (
                <div className="space-y-2">
                  {(["qz1", "qz2", "qz3"] as const).map((sk) => (
                    <Skeleton key={sk} className="h-8 w-full" />
                  ))}
                </div>
              ) : recentQuizzes.length === 0 ? (
                <div
                  data-ocid="dashboard.recent_quizzes.empty_state"
                  className="text-center py-4"
                >
                  <p className="text-xs text-muted-foreground">
                    No quizzes yet.
                  </p>
                  <Link to="/subjects" data-ocid="dashboard.start_quiz.link">
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 text-xs"
                    >
                      Start a Quiz
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentQuizzes.map((qr, i) => {
                    const pct = Math.round(qr.percentage);
                    const pass = pct >= 60;
                    return (
                      <div
                        key={qr.quizId.toString()}
                        data-ocid={`dashboard.quiz_score.item.${i + 1}`}
                        className="flex items-center justify-between text-xs px-2 py-1.5 rounded-md bg-muted/40"
                      >
                        <span className="text-muted-foreground truncate">
                          Quiz #{qr.quizId.toString()}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {pass ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-destructive" />
                          )}
                          <span
                            className={`font-semibold ${pass ? "text-teal-600" : "text-destructive"}`}
                          >
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick actions */}
      <h2 className="text-base font-display font-semibold text-foreground mb-3">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            label: "Review Due Flashcards",
            desc: `${dueCount} cards waiting`,
            icon: Brain,
            href: "/flashcards",
            iconBg: "bg-primary/10",
            iconColor: "text-primary",
            ocid: "dashboard.review_flashcards.button",
          },
          {
            label: "Browse ECE Cases",
            desc: "Clinical exposure scenarios",
            icon: Stethoscope,
            href: "/cases",
            iconBg: "bg-teal-50",
            iconColor: "text-teal-700",
            ocid: "dashboard.browse_cases.button",
          },
          {
            label: "Track Progress",
            desc: "View your study analytics",
            icon: TrendingUp,
            href: "/progress",
            iconBg: "bg-orange-50",
            iconColor: "text-orange-700",
            ocid: "dashboard.progress.button",
          },
        ].map((action) => (
          <Link
            key={action.href}
            to={action.href as "/flashcards" | "/cases" | "/progress"}
            data-ocid={action.ocid}
          >
            <Card className="border border-border bg-card hover:shadow-elevated transition-smooth cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${action.iconBg} flex items-center justify-center flex-shrink-0`}
                >
                  <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {action.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto flex-shrink-0" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </Layout>
  );
}

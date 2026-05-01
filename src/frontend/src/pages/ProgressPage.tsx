import { Layout } from "@/components/Layout";
import { PageLoader } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubjects, useUserProgress } from "@/hooks/useBackend";
import { SUBJECT_META } from "@/types";
import type { SubjectName } from "@/types";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Brain,
  Clock,
  FileQuestion,
  Flame,
  TrendingUp,
} from "lucide-react";

// ─── Mastery label helper ──────────────────────────────────────────────────────

function masteryLabel(pct: number): {
  label: string;
  variant: "outline" | "secondary" | "default";
} {
  if (pct >= 67) return { label: "Proficient", variant: "default" };
  if (pct >= 34) return { label: "Developing", variant: "secondary" };
  return { label: "Beginner", variant: "outline" };
}

// ─── Progress ring ─────────────────────────────────────────────────────────────

function ProgressRing({
  percent,
  size = 88,
  stroke = 7,
  trackClass = "stroke-muted",
  fillClass = "stroke-primary",
}: {
  percent: number;
  size?: number;
  stroke?: number;
  trackClass?: string;
  fillClass?: string;
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
        className={trackClass}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        className={fillClass}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </svg>
  );
}

// ─── Streak calendar widget ────────────────────────────────────────────────────

function StreakCalendar({ streakDays }: { streakDays: number }) {
  const today = new Date();
  // Generate last 35 days (5 rows × 7 cols)
  const days = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (34 - i));
    const daysAgo = 34 - i;
    // Mark as active if within streak window (most recent days)
    const isActive = daysAgo < streakDays;
    const isToday = daysAgo === 0;
    return { date: d, isActive, isToday, daysAgo };
  });

  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div data-ocid="progress.streak_calendar">
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayLabels.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] text-muted-foreground font-medium pb-0.5"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => (
          <div
            key={day.date.toISOString().slice(0, 10)}
            title={day.date.toLocaleDateString()}
            className={[
              "w-full aspect-square rounded-sm transition-colors duration-200",
              day.isToday ? "ring-2 ring-primary ring-offset-1" : "",
              day.isActive ? "bg-primary opacity-90" : "bg-muted",
            ].join(" ")}
            data-ocid={`progress.streak_day.${day.daysAgo}`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Last 35 days — blue = active study day
      </p>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

const ringFillClasses = [
  "stroke-primary",
  "stroke-[oklch(0.6_0.16_150)]",
  "stroke-secondary",
];

const barColors = ["bg-primary", "bg-[oklch(0.6_0.16_150)]", "bg-secondary"];

const subjectAccentBg = [
  "from-primary/10 to-primary/5",
  "from-[oklch(0.6_0.16_150)]/10 to-[oklch(0.6_0.16_150)]/5",
  "from-secondary/10 to-secondary/5",
];

export default function ProgressPage() {
  const { data: progress, isLoading } = useUserProgress();
  const { data: subjects } = useSubjects();

  if (isLoading)
    return (
      <Layout title="Progress">
        <PageLoader label="Loading your progress..." />
      </Layout>
    );

  const streak = Number(progress?.streakDays ?? 0);
  const totalMinutes = Number(progress?.totalStudyMinutes ?? 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const totalQuizzes =
    progress?.subjectProgress.reduce(
      (acc, sp) => acc + Number(sp.quizzesTaken),
      0,
    ) ?? 0;
  const totalCards =
    progress?.subjectProgress.reduce(
      (acc, sp) => acc + Number(sp.flashcardsReviewed),
      0,
    ) ?? 0;

  const subjectProgressMap = new Map(
    progress?.subjectProgress.map((sp) => [sp.subjectId.toString(), sp]) ?? [],
  );

  const hasAnyProgress = totalMinutes > 0 || totalQuizzes > 0 || totalCards > 0;

  // ─── Empty state ──────────────────────────────────────────────────────────────
  if (!hasAnyProgress) {
    return (
      <Layout title="Progress" subtitle="Your learning journey">
        <div
          className="flex flex-col items-center justify-center py-24 text-center"
          data-ocid="progress.empty_state"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
            <TrendingUp className="w-9 h-9 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Your journey starts here
          </h2>
          <p className="text-muted-foreground max-w-sm mb-8">
            Complete quizzes, review flashcards, and study topics to see your
            mastery progress build up here.
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            <Button asChild data-ocid="progress.start_quiz_button">
              <Link to="/subjects">Start a Quiz</Link>
            </Button>
            <Button
              variant="outline"
              asChild
              data-ocid="progress.start_flashcards_button"
            >
              <Link to="/flashcards">Review Flashcards</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Progress" subtitle="Your learning journey">
      {/* ── Overall stats row ──────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
        data-ocid="progress.stats.section"
      >
        {[
          {
            label: "Study Streak",
            value: `${streak} days`,
            icon: Flame,
            iconBg: "bg-orange-500/10 text-orange-500",
            ocid: "progress.streak_stat",
          },
          {
            label: "Total Study Time",
            value: `${hours}h ${mins}m`,
            icon: Clock,
            iconBg: "bg-primary/10 text-primary",
            ocid: "progress.study_time_stat",
          },
          {
            label: "Quizzes Taken",
            value: String(totalQuizzes),
            icon: FileQuestion,
            iconBg: "bg-[oklch(0.6_0.16_150)]/10 text-[oklch(0.6_0.16_150)]",
            ocid: "progress.quizzes_stat",
          },
          {
            label: "Cards Mastered",
            value: String(totalCards),
            icon: Brain,
            iconBg: "bg-secondary/10 text-secondary-foreground",
            ocid: "progress.cards_stat",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            data-ocid={stat.ocid}
            className="border border-border bg-card shadow-subtle"
          >
            <CardContent className="p-4">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${stat.iconBg}`}
              >
                <stat.icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-display font-bold text-foreground leading-none mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Subject mastery cards ──────────────────────────────────────────── */}
      <h2
        className="font-display font-semibold text-lg text-foreground mb-4"
        data-ocid="progress.mastery.heading"
      >
        Subject Mastery
      </h2>
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
        data-ocid="progress.subjects.list"
      >
        {(subjects ?? []).map((subject, i) => {
          const meta = SUBJECT_META[subject.name as SubjectName];
          const sp = subjectProgressMap.get(subject.id.toString());
          const mastery = sp ? Math.round(sp.masteryPercent) : 0;
          const { label: mLabel, variant: mVariant } = masteryLabel(mastery);
          const minutes = Number(sp?.totalStudyMinutes ?? 0n);
          const subH = Math.floor(minutes / 60);
          const subM = minutes % 60;

          return (
            <Card
              key={subject.id.toString()}
              data-ocid={`progress.subject.item.${i + 1}`}
              className="border border-border bg-card shadow-subtle overflow-hidden"
            >
              {/* Gradient header strip */}
              <div
                className={`h-1.5 w-full bg-gradient-to-r ${subjectAccentBg[i % 3]}`}
              />
              <CardContent className="p-5">
                {/* Subject name + badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{meta.icon}</span>
                    <span className="font-display font-semibold text-foreground">
                      {meta.label}
                    </span>
                  </div>
                  <Badge variant={mVariant} className="text-xs">
                    {mLabel}
                  </Badge>
                </div>

                {/* Ring + stats */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <ProgressRing
                      percent={mastery}
                      size={88}
                      stroke={7}
                      fillClass={ringFillClasses[i % 3]}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold font-display text-foreground leading-none">
                        {mastery}%
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    {[
                      {
                        label: "Topics Studied",
                        value: sp?.topicsStudied?.toString() ?? "0",
                      },
                      {
                        label: "Quizzes Taken",
                        value: sp?.quizzesTaken?.toString() ?? "0",
                      },
                      {
                        label: "Cards Reviewed",
                        value: sp?.flashcardsReviewed?.toString() ?? "0",
                      },
                      { label: "Time Spent", value: `${subH}h ${subM}m` },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="text-muted-foreground truncate">
                          {item.label}
                        </span>
                        <span className="font-semibold text-foreground flex-shrink-0">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mastery progress bar */}
                <div className="mt-4">
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-700 ${barColors[i % 3]}`}
                      style={{ width: `${mastery}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Bottom row: activity bars + streak calendar ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Activity overview */}
        <Card
          className="border border-border bg-card shadow-subtle"
          data-ocid="progress.activity.section"
        >
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base font-semibold text-foreground">
              Study Time by Subject
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-5">
            <div className="space-y-4">
              {(subjects ?? []).map((subject, i) => {
                const meta = SUBJECT_META[subject.name as SubjectName];
                const sp = subjectProgressMap.get(subject.id.toString());
                const minutes = Number(sp?.totalStudyMinutes ?? 0n);
                const pct =
                  totalMinutes > 0
                    ? Math.round((minutes / totalMinutes) * 100)
                    : 0;
                const subH = Math.floor(minutes / 60);
                const subM = minutes % 60;
                return (
                  <div
                    key={subject.id.toString()}
                    data-ocid={`progress.study_time.item.${i + 1}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{meta.icon}</span>
                        <span className="text-sm font-medium text-foreground">
                          {meta.label}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {subH}h {subM}m
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-700 ${barColors[i % 3]}`}
                        style={{ width: `${pct}%` }}
                        aria-label={`${meta.label} study time ${pct}%`}
                      />
                    </div>
                    <p className="text-right text-[11px] text-muted-foreground mt-0.5">
                      {pct}% of total
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Streak calendar */}
        <Card
          className="border border-border bg-card shadow-subtle"
          data-ocid="progress.streak.section"
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-base font-semibold text-foreground">
                Study Streak
              </CardTitle>
              <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-500 px-2.5 py-1 rounded-full">
                <Flame className="w-3.5 h-3.5" />
                <span className="text-sm font-bold">{streak} days</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-5">
            <StreakCalendar streakDays={streak} />
          </CardContent>
        </Card>
      </div>

      {/* ── Mastery legend ─────────────────────────────────────────────────── */}
      <Card
        className="border border-border bg-muted/40"
        data-ocid="progress.legend.section"
      >
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Mastery Levels
          </p>
          <div className="flex flex-wrap gap-4">
            {[
              {
                range: "0–33%",
                label: "Beginner",
                color: "bg-muted border border-border text-foreground",
              },
              {
                range: "34–66%",
                label: "Developing",
                color:
                  "bg-secondary/20 border border-secondary/30 text-foreground",
              },
              {
                range: "67–100%",
                label: "Proficient",
                color: "bg-primary/15 border border-primary/30 text-primary",
              },
            ].map((level) => (
              <div key={level.label} className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${level.color}`}
                >
                  {level.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {level.range}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}

import { Layout } from "@/components/Layout";
import { PageLoader } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuizHistory } from "@/hooks/useBackend";
import type { QuizResult } from "@/types";
import { Link } from "@tanstack/react-router";
import {
  BarChart2,
  BookOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";

// ─── Score circle ──────────────────────────────────────────────────────────────

function ScoreCircle({
  pct,
  size = "md",
}: {
  pct: number;
  size?: "sm" | "md";
}) {
  const colorClass =
    pct >= 70
      ? "text-green-600 border-green-400"
      : pct >= 50
        ? "text-secondary border-secondary"
        : "text-destructive border-destructive";

  const sizeClass = size === "sm" ? "w-14 h-14 text-base" : "w-20 h-20 text-xl";

  return (
    <div
      className={`rounded-full border-3 flex flex-col items-center justify-center flex-shrink-0 ${colorClass} ${sizeClass}`}
      style={{ borderWidth: 3 }}
    >
      <span className="font-display font-black leading-none">{pct}%</span>
    </div>
  );
}

// ─── Grade badge ───────────────────────────────────────────────────────────────

function GradeBadge({ pct }: { pct: number }) {
  if (pct >= 70)
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200 font-semibold">
        Pass
      </Badge>
    );
  if (pct >= 50)
    return (
      <Badge className="bg-secondary/15 text-secondary border-secondary/30 font-semibold">
        Average
      </Badge>
    );
  return (
    <Badge className="bg-destructive/10 text-destructive border-destructive/20 font-semibold">
      Needs Work
    </Badge>
  );
}

// ─── Answer dots ───────────────────────────────────────────────────────────────

function AnswerDots({ correct }: { correct: boolean[] }) {
  return (
    <div className="flex gap-1 flex-wrap max-w-28">
      {correct.slice(0, 20).map((c, j) => {
        const dotKey = `q${j}-${c ? "ok" : "no"}`;
        return c ? (
          <CheckCircle2 key={dotKey} className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <XCircle key={dotKey} className="w-3.5 h-3.5 text-destructive" />
        );
      })}
    </div>
  );
}

// ─── Stats summary ─────────────────────────────────────────────────────────────

function StatsSummary({ results }: { results: QuizResult[] }) {
  if (results.length === 0) return null;
  const avg = Math.round(
    results.reduce((s, r) => s + r.percentage, 0) / results.length,
  );
  const best = Math.max(...results.map((r) => r.percentage));
  const total = results.length;

  const stats = [
    { icon: BarChart2, label: "Avg Score", value: `${avg}%` },
    { icon: TrendingUp, label: "Best Score", value: `${best}%` },
    { icon: Clock, label: "Total Quizzes", value: String(total) },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {stats.map((s) => (
        <Card
          key={s.label}
          className="border border-border bg-card shadow-subtle"
        >
          <CardContent className="p-4 text-center">
            <s.icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
            <p className="text-xl font-display font-bold text-foreground">
              {s.value}
            </p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── History item ──────────────────────────────────────────────────────────────

function HistoryItem({
  result,
  index,
}: {
  result: QuizResult;
  index: number;
}) {
  const pct = result.percentage;
  const date = new Date(Number(result.completedAt)).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
  const time = new Date(Number(result.completedAt)).toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
    >
      <Card
        data-ocid={`quiz_history.item.${index + 1}`}
        className="border border-border bg-card shadow-subtle hover:shadow-md transition-shadow duration-200"
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <ScoreCircle pct={pct} size="sm" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-semibold text-foreground">
                  Attempt #{index + 1}
                </span>
                <GradeBadge pct={pct} />
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {Number(result.score)} / {Number(result.totalQuestions)} correct
                &nbsp;·&nbsp; {date} at {time}
              </p>
              <AnswerDots correct={result.correctAnswers} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function QuizResultPage() {
  const { data: history, isLoading } = useQuizHistory();

  if (isLoading)
    return (
      <Layout title="Quiz History">
        <PageLoader />
      </Layout>
    );

  const results = history ?? [];

  return (
    <Layout
      title="Quiz History"
      subtitle="Track your performance across all quiz attempts"
    >
      <div className="max-w-2xl">
        {results.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center py-16"
            data-ocid="quiz_history.empty_state"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="font-display font-semibold text-foreground text-xl mb-2">
              No quizzes yet
            </h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
              Complete a quiz to see your results and track your progress here.
            </p>
            <Link to="/subjects" data-ocid="quiz_history.start.link">
              <Button data-ocid="quiz_history.browse.button">
                Browse Subjects
              </Button>
            </Link>
          </motion.div>
        ) : (
          <>
            <StatsSummary results={results} />

            <Card className="border border-border bg-card shadow-subtle mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Performance Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-end gap-1.5 h-16">
                  {results
                    .slice(-12)
                    .reverse()
                    .map((r, i) => {
                      const pct = r.percentage;
                      const barColor =
                        pct >= 70
                          ? "bg-green-400"
                          : pct >= 50
                            ? "bg-secondary"
                            : "bg-destructive";
                      return (
                        <div
                          key={`bar-${r.quizId.toString()}`}
                          className="flex-1 flex flex-col items-center gap-1"
                        >
                          <div
                            className={`w-full rounded-t ${barColor} transition-all`}
                            style={{ height: `${Math.max(8, pct * 0.6)}px` }}
                            title={`${pct}%`}
                          />
                          {i % 3 === 0 && (
                            <span className="text-[9px] text-muted-foreground">
                              {i + 1}
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            <h3 className="font-display font-semibold text-foreground text-base mb-3">
              All Attempts ({results.length})
            </h3>
            <div className="space-y-3" data-ocid="quiz_history.list">
              {results.map((r, i) => (
                <HistoryItem key={r.quizId.toString()} result={r} index={i} />
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link to="/subjects" data-ocid="quiz_history.browse_more.link">
                <Button
                  variant="outline"
                  data-ocid="quiz_history.browse.button"
                >
                  Take Another Quiz
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

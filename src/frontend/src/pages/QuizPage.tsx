import { Layout } from "@/components/Layout";
import { PageLoader } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuestions } from "@/hooks/useBackend";
import type { Question, QuizResult } from "@/types";
import { Link, useParams } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Clock, Trophy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Timer display ─────────────────────────────────────────────────────────────

function TimerBar({
  timeLeft,
  totalTime,
}: {
  timeLeft: number;
  totalTime: number;
}) {
  const pct = (timeLeft / totalTime) * 100;
  const isWarning = pct < 25;
  const isCritical = pct < 10;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="flex items-center gap-3 w-full">
      <span
        className={`text-sm font-mono font-bold tabular-nums flex-shrink-0 ${isCritical ? "text-destructive" : isWarning ? "text-secondary" : "text-muted-foreground"}`}
        data-ocid="quiz.timer"
      >
        <Clock className="w-3.5 h-3.5 inline mr-1" />
        {mins}:{secs.toString().padStart(2, "0")}
      </span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full transition-colors duration-300 ${isCritical ? "bg-destructive" : isWarning ? "bg-secondary" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </div>
    </div>
  );
}

// ─── Option button ─────────────────────────────────────────────────────────────

function OptionButton({
  label,
  text,
  selected,
  onClick,
  ocid,
}: {
  label: string;
  text: string;
  selected: boolean;
  onClick: () => void;
  ocid: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={ocid}
      className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all duration-200 flex items-start gap-3
        ${
          selected
            ? "border-primary bg-primary/8 text-primary shadow-sm"
            : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/50 hover:shadow-sm"
        }`}
    >
      <span
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs flex-shrink-0 font-bold mt-0.5
          ${selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground text-muted-foreground"}`}
      >
        {label}
      </span>
      <span className="leading-relaxed">{text}</span>
    </button>
  );
}

// ─── Setup screen ──────────────────────────────────────────────────────────────

function SetupScreen({
  topicId,
  availableCount,
  onStart,
}: {
  topicId: bigint;
  availableCount: number;
  onStart: (count: number) => void;
}) {
  const [selected, setSelected] = useState<5 | 10 | 20>(10);
  const options: Array<{ count: 5 | 10 | 20; label: string; time: string }> = [
    { count: 5, label: "5 Questions", time: "5 min" },
    { count: 10, label: "10 Questions", time: "10 min" },
    { count: 20, label: "20 Questions", time: "20 min" },
  ];

  return (
    <div className="max-w-lg mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-display font-bold text-foreground text-2xl mb-2">
          Ready to Quiz?
        </h2>
        <p className="text-muted-foreground text-sm">
          {availableCount} questions available · Multiple Choice
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-8"
      >
        <p className="text-sm font-semibold text-foreground mb-3">
          Select question count
        </p>
        <div className="grid grid-cols-3 gap-3">
          {options.map((opt) => (
            <button
              key={opt.count}
              type="button"
              onClick={() => setSelected(opt.count)}
              data-ocid={`quiz.count.${opt.count}`}
              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                ${
                  selected === opt.count
                    ? "border-primary bg-primary/8 text-primary shadow-sm"
                    : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/30"
                }`}
            >
              <span className="text-xl font-display font-bold">
                {opt.count}
              </span>
              <span className="text-xs font-medium mt-0.5 opacity-80">
                {opt.time}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-muted/40 rounded-xl p-4 mb-8 text-sm text-muted-foreground"
      >
        <div className="flex justify-between">
          <span>Questions</span>
          <span className="font-semibold text-foreground">
            {Math.min(selected, availableCount)}
          </span>
        </div>
        <div className="flex justify-between mt-1.5">
          <span>Time allowed</span>
          <span className="font-semibold text-foreground">
            {selected} minutes
          </span>
        </div>
        <div className="flex justify-between mt-1.5">
          <span>Type</span>
          <span className="font-semibold text-foreground">Multiple Choice</span>
        </div>
      </motion.div>

      <div className="flex gap-3">
        <Link to="/topics/$topicId" params={{ topicId: topicId.toString() }}>
          <Button variant="outline" size="lg" data-ocid="quiz.back.button">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </Link>
        <Button
          onClick={() => onStart(selected)}
          size="lg"
          className="flex-1"
          data-ocid="quiz.start.button"
        >
          Start Quiz
        </Button>
      </div>
    </div>
  );
}

// ─── In-progress screen ────────────────────────────────────────────────────────

function QuizInProgress({
  questions,
  answers,
  current,
  timeLeft,
  totalTime,
  onAnswer,
  onPrev,
  onNext,
  onSubmit,
}: {
  questions: Question[];
  answers: (number | null)[];
  current: number;
  timeLeft: number;
  totalTime: number;
  onAnswer: (idx: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  const q = questions[current];
  const isLast = current === questions.length - 1;
  const answered = answers.filter((a) => a !== null).length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Timer bar */}
      <div className="mb-5">
        <TimerBar timeLeft={timeLeft} totalTime={totalTime} />
      </div>

      {/* Progress header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            Question {current + 1}
            <span className="text-muted-foreground font-normal">
              {" "}
              / {questions.length}
            </span>
          </span>
          <Badge variant="outline" className="text-xs font-normal">
            {answered}/{questions.length} answered
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSubmit}
          data-ocid="quiz.submit.button"
          className="text-muted-foreground hover:text-foreground"
        >
          Submit Quiz
        </Button>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1 mb-5 flex-wrap">
        {questions.map((q, i) => (
          <div
            key={q.id.toString()}
            className={`h-1.5 rounded-full transition-all duration-200 ${
              i === current
                ? "bg-primary w-6"
                : answers[i] !== null
                  ? "bg-primary/40 w-3"
                  : "bg-muted-foreground/20 w-3"
            }`}
          />
        ))}
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <Card className="border border-border bg-card shadow-subtle mb-5">
            <CardContent className="p-6">
              <p
                className="font-medium text-foreground text-base leading-relaxed"
                data-ocid="quiz.question.text"
              >
                <span className="text-primary font-bold mr-2">
                  Q{current + 1}.
                </span>
                {q.text}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-2.5 mb-6">
            {q.options.map((opt, i) => (
              <OptionButton
                key={`${q.id.toString()}-opt-${i}`}
                label={String.fromCharCode(65 + i)}
                text={opt}
                selected={answers[current] === i}
                onClick={() => onAnswer(i)}
                ocid={`quiz.option.${i + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between gap-3">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={current === 0}
          data-ocid="quiz.prev.button"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>
        {isLast ? (
          <Button onClick={onSubmit} data-ocid="quiz.finish.button">
            Finish Quiz
          </Button>
        ) : (
          <Button onClick={onNext} data-ocid="quiz.next.button">
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Inline result ─────────────────────────────────────────────────────────────

function InlineResult({
  result,
  questions,
  answers,
  topicId,
  questionCount: _questionCount,
  onRetry,
}: {
  result: QuizResult;
  questions: Question[];
  answers: (number | null)[];
  topicId: bigint;
  questionCount?: number;
  onRetry: () => void;
}) {
  const pct = result.percentage;
  const grade =
    pct >= 70
      ? "Excellent work!"
      : pct >= 50
        ? "Good effort!"
        : "Keep practising!";
  const scoreColor =
    pct >= 70
      ? "text-green-600"
      : pct >= 50
        ? "text-secondary"
        : "text-destructive";
  const scoreRing =
    pct >= 70
      ? "border-green-400"
      : pct >= 50
        ? "border-secondary"
        : "border-destructive";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Score card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border border-border bg-card shadow-elevated mb-6">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div
                className={`w-24 h-24 rounded-full border-4 ${scoreRing} flex flex-col items-center justify-center flex-shrink-0`}
              >
                <span
                  className={`text-2xl font-display font-black ${scoreColor}`}
                >
                  {pct}%
                </span>
              </div>
              <div className="text-center sm:text-left">
                <h2 className="font-display font-bold text-foreground text-xl mb-1">
                  {grade}
                </h2>
                <p className="text-muted-foreground text-sm">
                  You scored{" "}
                  <strong className="text-foreground">
                    {Number(result.score)} out of{" "}
                    {Number(result.totalQuestions)}
                  </strong>{" "}
                  questions correctly.
                </p>
                <div className="flex gap-3 mt-3 justify-center sm:justify-start">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    ✓ {Number(result.score)} correct
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/8 border border-destructive/20 px-2 py-0.5 rounded-full">
                    ✗ {Number(result.totalQuestions) - Number(result.score)}{" "}
                    wrong
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Question breakdown */}
      <h3 className="font-display font-semibold text-foreground text-lg mb-3">
        Question Breakdown
      </h3>
      <div className="space-y-3 mb-6">
        {questions.map((q, i) => {
          const wasCorrect = result.correctAnswers[i];
          const userAns = answers[i];
          return (
            <motion.div
              key={q.id.toString()}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card
                data-ocid={`quiz.result.item.${i + 1}`}
                className={`border-2 ${wasCorrect ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${wasCorrect ? "bg-green-500 text-white" : "bg-destructive text-white"}`}
                    >
                      {wasCorrect ? "✓" : "✗"}
                    </span>
                    <p className="text-sm font-medium text-foreground leading-relaxed">
                      <span className="text-muted-foreground font-normal mr-1">
                        Q{i + 1}.
                      </span>
                      {q.text}
                    </p>
                  </div>

                  <div className="ml-9 space-y-2">
                    {userAns !== null && userAns !== undefined && (
                      <div
                        className={`text-xs px-3 py-2 rounded-lg ${wasCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        <span className="font-semibold">Your answer: </span>
                        {String.fromCharCode(65 + userAns)}.{" "}
                        {q.options[userAns]}
                      </div>
                    )}
                    {!wasCorrect && (
                      <div className="text-xs px-3 py-2 rounded-lg bg-green-100 text-green-800">
                        <span className="font-semibold">Correct answer: </span>
                        {String.fromCharCode(65 + Number(q.correctIndex))}.{" "}
                        {q.options[Number(q.correctIndex)]}
                      </div>
                    )}
                    {q.explanation && (
                      <div className="text-xs px-3 py-2 rounded-lg bg-muted/60 text-muted-foreground border border-border">
                        <span className="font-semibold text-foreground">
                          Explanation:{" "}
                        </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          to="/topics/$topicId"
          params={{ topicId: topicId.toString() }}
          data-ocid="quiz.result.back.link"
          className="flex-1"
        >
          <Button variant="outline" className="w-full">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Topic
          </Button>
        </Link>
        <Button
          onClick={onRetry}
          className="flex-1"
          data-ocid="quiz.result.retry.button"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function QuizPage() {
  const params = useParams({ strict: false });
  const topicId = BigInt((params as Record<string, string>).topicId ?? "1");

  const { data: allQuestions, isLoading } = useQuestions(topicId);

  const [phase, setPhase] = useState<"setup" | "active" | "result">("setup");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionsRef = useRef<Question[]>([]);
  const phaseRef = useRef<"setup" | "active" | "result">("setup");

  const handleSubmit = useCallback(
    (finalAnswers?: (number | null)[]) => {
      const ans = finalAnswers ?? answers;
      const qs = questionsRef.current;
      const resolved = ans.map((a) => a ?? -1);
      const correct = qs.map((q, i) => resolved[i] === Number(q.correctIndex));
      const score = correct.filter(Boolean).length;
      const res: QuizResult = {
        quizId: BigInt(Date.now()),
        score: BigInt(score),
        totalQuestions: BigInt(resolved.length),
        percentage:
          resolved.length > 0 ? Math.round((score / resolved.length) * 100) : 0,
        correctAnswers: correct,
        completedAt: BigInt(Date.now()),
      };
      if (timerRef.current) clearInterval(timerRef.current);
      setResult(res);
      phaseRef.current = "result";
      setPhase("result");
    },
    [answers],
  );

  const handleSubmitRef = useRef(handleSubmit);
  handleSubmitRef.current = handleSubmit;

  // Auto-submit when timer expires
  useEffect(() => {
    if (phase !== "active") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          if (phaseRef.current === "active") {
            setAnswers((currentAnswers) => {
              handleSubmitRef.current(currentAnswers);
              return currentAnswers;
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  function startQuiz(count: number) {
    const pool = (allQuestions ?? []).slice(0, count);
    const time = count * 60; // 1 min per question
    setQuestions(pool);
    questionsRef.current = pool;
    setAnswers(new Array(pool.length).fill(null));
    setCurrent(0);
    setTimeLeft(time);
    setTotalTime(time);
    phaseRef.current = "active";
    setPhase("active");
  }

  function handleRetry() {
    setResult(null);
    setPhase("setup");
    setCurrent(0);
  }

  if (isLoading)
    return (
      <Layout title="Quiz">
        <PageLoader />
      </Layout>
    );

  return (
    <Layout
      title={
        phase === "setup"
          ? "Quiz Setup"
          : phase === "result"
            ? "Quiz Result"
            : `Question ${current + 1} of ${questions.length}`
      }
      actions={
        phase === "active" ? null : (
          <Link
            to="/topics/$topicId"
            params={{ topicId: topicId.toString() }}
            data-ocid="quiz.back.link"
          >
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
        )
      }
    >
      {phase === "setup" && (
        <SetupScreen
          topicId={topicId}
          availableCount={(allQuestions ?? []).length}
          onStart={startQuiz}
        />
      )}

      {phase === "active" && (
        <QuizInProgress
          questions={questions}
          answers={answers}
          current={current}
          timeLeft={timeLeft}
          totalTime={totalTime}
          onAnswer={(idx) =>
            setAnswers((prev) => {
              const next = [...prev];
              next[current] = idx;
              return next;
            })
          }
          onPrev={() => setCurrent((c) => Math.max(0, c - 1))}
          onNext={() =>
            setCurrent((c) => Math.min(questions.length - 1, c + 1))
          }
          onSubmit={() => handleSubmit()}
        />
      )}

      {phase === "result" && result && (
        <InlineResult
          result={result}
          questions={questions}
          answers={answers}
          topicId={topicId}
          onRetry={handleRetry}
        />
      )}
    </Layout>
  );
}

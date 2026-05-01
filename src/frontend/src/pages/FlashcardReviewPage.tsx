import { Layout } from "@/components/Layout";
import { PageLoader } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useDueFlashcards,
  useFlashcards,
  useReviewFlashcard,
} from "@/hooks/useBackend";
import type { FlashcardRating } from "@/types";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Minus,
  RotateCcw,
  Trophy,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// ─── 3D Flip Card ─────────────────────────────────────────────────────────────

function FlipCard({
  front,
  back,
  flipped,
  onClick,
}: {
  front: string;
  back: string;
  flipped: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
      style={{ perspective: "1200px", height: "300px" }}
      onClick={onClick}
      aria-label={flipped ? "Show front" : "Flip to see answer"}
      data-ocid="flashcard_review.card"
    >
      <div
        className="relative w-full h-full transition-transform duration-500 cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl bg-card border border-border shadow-lg flex flex-col items-center justify-center p-8 text-center gap-3"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <Badge
            variant="outline"
            className="text-xs tracking-wide uppercase font-medium"
          >
            Question
          </Badge>
          <p className="text-foreground font-medium text-lg leading-relaxed">
            {front}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Press{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
              Space
            </kbd>{" "}
            or tap to reveal answer
          </p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl bg-primary/5 border border-primary/25 shadow-lg flex flex-col items-center justify-center p-8 text-center gap-3"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <Badge className="text-xs tracking-wide uppercase font-medium bg-primary/10 text-primary border-primary/30">
            Answer
          </Badge>
          <p className="text-foreground font-medium text-lg leading-relaxed">
            {back}
          </p>
        </div>
      </div>
    </button>
  );
}

// ─── Rating Button ─────────────────────────────────────────────────────────

function RatingButton({
  rating,
  shortcut,
  label,
  icon,
  colorClass,
  onClick,
  ocid,
}: {
  rating: FlashcardRating;
  shortcut: string;
  label: string;
  icon: React.ReactNode;
  colorClass: string;
  onClick: (r: FlashcardRating) => void;
  ocid: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(rating)}
      data-ocid={ocid}
      className={`flex flex-col items-center justify-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-all duration-150 font-medium text-sm hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring ${colorClass}`}
    >
      {icon}
      <span>{label}</span>
      <kbd className="text-[10px] opacity-60 font-mono bg-black/5 px-1.5 py-0.5 rounded">
        {shortcut}
      </kbd>
    </button>
  );
}

// ─── Done Screen ──────────────────────────────────────────────────────────────

function DoneScreen({
  total,
  stats,
  onRestart,
}: {
  total: number;
  stats: { easy: number; good: number; hard: number };
  onRestart: () => void;
}) {
  const mastery = Math.round(
    ((stats.easy * 1 + stats.good * 0.7) / (total || 1)) * 100,
  );

  return (
    <Layout title="Session Complete">
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-sm mx-auto py-8"
        data-ocid="flashcard_review.success_state"
      >
        {/* Trophy */}
        <div className="w-20 h-20 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-5">
          <Trophy className="w-10 h-10 text-secondary" />
        </div>

        <h2 className="font-display font-bold text-foreground text-2xl mb-2">
          Session Complete!
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          You reviewed <strong>{total}</strong> flashcards. Estimated mastery:{" "}
          <strong>{mastery}%</strong>
        </p>

        {/* Mastery bar */}
        <div className="w-full bg-muted rounded-full h-3 mb-6">
          <div
            className="h-3 rounded-full bg-emerald-500 transition-all duration-700"
            style={{ width: `${mastery}%` }}
          />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 w-full mb-6">
          <div className="flex flex-col items-center p-3 rounded-xl border border-destructive/20 bg-destructive/5">
            <XCircle className="w-5 h-5 text-destructive mb-1" />
            <span className="text-xl font-bold text-destructive">
              {stats.hard}
            </span>
            <span className="text-xs text-muted-foreground">Hard</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl border border-primary/20 bg-primary/5">
            <Minus className="w-5 h-5 text-primary mb-1" />
            <span className="text-xl font-bold text-primary">{stats.good}</span>
            <span className="text-xs text-muted-foreground">Good</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl border border-emerald-200 bg-emerald-50">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-1" />
            <span className="text-xl font-bold text-emerald-600">
              {stats.easy}
            </span>
            <span className="text-xs text-muted-foreground">Easy</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <Link
            to="/flashcards"
            className="flex-1"
            data-ocid="flashcard_review.finish.link"
          >
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Decks
            </Button>
          </Link>
          <Button
            className="flex-1"
            onClick={onRestart}
            data-ocid="flashcard_review.restart.button"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Review Again
          </Button>
        </div>
      </div>
    </Layout>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function FlashcardReviewPage() {
  const params = useParams({ strict: false });
  const topicIdParam = (params as Record<string, string>).topicId;

  const isDueReview = !topicIdParam;
  const topicId = BigInt(topicIdParam ?? "1");

  const { data: topicCards, isLoading: topicLoading } = useFlashcards(topicId);
  const { data: dueCards, isLoading: dueLoading } = useDueFlashcards();
  const { mutate: reviewCard } = useReviewFlashcard();

  const isLoading = isDueReview ? dueLoading : topicLoading;
  const cards = isDueReview ? (dueCards ?? []) : (topicCards ?? []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [stats, setStats] = useState({ easy: 0, good: 0, hard: 0 });

  const card = cards[currentIndex];

  const handleRate = useCallback(
    (rating: FlashcardRating) => {
      if (!card) return;
      reviewCard({ cardId: card.id, rating });
      setStats((prev) => ({ ...prev, [rating]: prev[rating] + 1 }));
      if (currentIndex + 1 >= cards.length) {
        setCompleted(true);
      } else {
        setCurrentIndex((i) => i + 1);
        setFlipped(false);
      }
    },
    [card, currentIndex, cards.length, reviewCard],
  );

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
      if (flipped) {
        if (e.key === "1") handleRate("hard");
        if (e.key === "2") handleRate("good");
        if (e.key === "3") handleRate("easy");
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [flipped, handleRate]);

  const handleRestart = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setCompleted(false);
    setStats({ easy: 0, good: 0, hard: 0 });
  };

  if (isLoading)
    return (
      <Layout title="Flashcard Review">
        <PageLoader />
      </Layout>
    );

  if (cards.length === 0) {
    return (
      <Layout title="Flashcard Review">
        <div
          className="flex flex-col items-center justify-center min-h-64 text-center"
          data-ocid="flashcard_review.empty_state"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-2xl">
            🎉
          </div>
          <h2 className="font-display font-semibold text-foreground text-xl mb-2">
            All caught up!
          </h2>
          <p className="text-muted-foreground text-sm mb-5">
            No flashcards due for review right now. Check back later.
          </p>
          <Link to="/flashcards" data-ocid="flashcard_review.back.link">
            <Button variant="default">Back to Flashcards</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (completed) {
    return (
      <DoneScreen
        total={cards.length}
        stats={stats}
        onRestart={handleRestart}
      />
    );
  }

  const progress = Math.round((currentIndex / cards.length) * 100);
  const remaining = cards.length - currentIndex;
  const estMinutes = Math.ceil((remaining * 20) / 60);

  return (
    <Layout
      title="Flashcard Review"
      subtitle={isDueReview ? "Due cards" : "Topic review"}
      actions={
        <Link to="/flashcards" data-ocid="flashcard_review.exit.link">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Exit
          </Button>
        </Link>
      }
    >
      <div className="max-w-xl mx-auto">
        {/* Top progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1">
              <span className="font-semibold text-foreground">
                {currentIndex + 1}
              </span>
              <span>/ {cards.length} cards</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />~{estMinutes}m remaining
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-2 mb-5 justify-center">
          <Badge
            variant="outline"
            className="text-destructive border-destructive/30 bg-destructive/5 gap-1"
          >
            <XCircle className="w-3 h-3" />
            {stats.hard} Hard
          </Badge>
          <Badge
            variant="outline"
            className="text-primary border-primary/30 bg-primary/5 gap-1"
          >
            <Minus className="w-3 h-3" />
            {stats.good} Good
          </Badge>
          <Badge
            variant="outline"
            className="text-emerald-600 border-emerald-300 bg-emerald-50 gap-1"
          >
            <CheckCircle2 className="w-3 h-3" />
            {stats.easy} Easy
          </Badge>
        </div>

        {/* Flip card */}
        <FlipCard
          front={card.front}
          back={card.back}
          flipped={flipped}
          onClick={() => setFlipped((f) => !f)}
        />

        {/* Rating buttons */}
        {flipped ? (
          <div
            className="mt-6 grid grid-cols-3 gap-3"
            data-ocid="flashcard_review.rating"
          >
            <RatingButton
              rating="hard"
              shortcut="1"
              label="Hard"
              icon={<XCircle className="w-5 h-5" />}
              colorClass="border-destructive/40 text-destructive bg-destructive/5 hover:bg-destructive/10"
              onClick={handleRate}
              ocid="flashcard_review.hard.button"
            />
            <RatingButton
              rating="good"
              shortcut="2"
              label="Good"
              icon={<Minus className="w-5 h-5" />}
              colorClass="border-primary/40 text-primary bg-primary/5 hover:bg-primary/10"
              onClick={handleRate}
              ocid="flashcard_review.good.button"
            />
            <RatingButton
              rating="easy"
              shortcut="3"
              label="Easy"
              icon={<CheckCircle2 className="w-5 h-5" />}
              colorClass="border-emerald-400 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
              onClick={handleRate}
              ocid="flashcard_review.easy.button"
            />
          </div>
        ) : (
          <div className="mt-6 flex justify-center">
            <Button
              variant="default"
              size="lg"
              onClick={() => setFlipped(true)}
              data-ocid="flashcard_review.flip.button"
            >
              Flip Card
              <kbd className="ml-2 text-xs opacity-70 font-mono bg-white/20 px-1.5 py-0.5 rounded">
                Space
              </kbd>
            </Button>
          </div>
        )}

        {/* Keyboard hint */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          {flipped
            ? "Rate: 1 = Hard · 2 = Good · 3 = Easy"
            : "Press Space to flip card"}
        </p>
      </div>
    </Layout>
  );
}

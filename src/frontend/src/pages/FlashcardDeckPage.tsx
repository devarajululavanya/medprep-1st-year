import { Layout } from "@/components/Layout";
import { PageLoader } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useDueFlashcards,
  useFlashcards,
  useSubjects,
  useTopics,
} from "@/hooks/useBackend";
import { SUBJECT_META } from "@/types";
import type { FlashcardStatus, SubjectName } from "@/types";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  PlayCircle,
  Sparkles,
} from "lucide-react";

// ─── Status helpers ──────────────────────────────────────────────────────────

function getCardStatus(index: number): FlashcardStatus {
  if (index % 5 === 0) return "mastered";
  if (index % 3 === 0) return "learning";
  return "new";
}

function StatusBadge({ status }: { status: FlashcardStatus }) {
  if (status === "mastered")
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0">
        <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
        Mastered
      </Badge>
    );
  if (status === "learning")
    return (
      <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] px-1.5 py-0">
        <Sparkles className="w-2.5 h-2.5 mr-0.5" />
        Learning
      </Badge>
    );
  return (
    <Badge className="bg-muted text-muted-foreground border-border text-[10px] px-1.5 py-0">
      <Clock className="w-2.5 h-2.5 mr-0.5" />
      New
    </Badge>
  );
}

// ─── Topic Deck View ─────────────────────────────────────────────────────────

function TopicDeckView({ topicId }: { topicId: bigint }) {
  const { data: cards, isLoading } = useFlashcards(topicId);

  if (isLoading) return <PageLoader />;

  const cardList = cards ?? [];

  // Derive topic title from subjects' topics — just use the topicId for display
  const totalCards = cardList.length;
  const masteredCount = cardList.filter(
    (_, i) => getCardStatus(i) === "mastered",
  ).length;
  const learningCount = cardList.filter(
    (_, i) => getCardStatus(i) === "learning",
  ).length;
  const newCount = totalCards - masteredCount - learningCount;
  const estMinutes = Math.ceil((totalCards * 20) / 60);

  const subjectId = cardList[0]?.topicId
    ? cardList[0].topicId <= 12n
      ? 1n
      : cardList[0].topicId <= 22n
        ? 2n
        : 3n
    : 1n;

  const subjectName: SubjectName =
    subjectId === 1n
      ? "anatomy"
      : subjectId === 2n
        ? "physiology"
        : "biochemistry";
  const meta = SUBJECT_META[subjectName];

  return (
    <Layout
      title="Flashcard Deck"
      subtitle={`${meta.icon} ${meta.label}`}
      actions={
        <Link to="/flashcards" data-ocid="flashcard_deck.back.link">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            All Decks
          </Button>
        </Link>
      }
    >
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Total Cards",
            value: totalCards,
            icon: <BookOpen className="w-4 h-4" />,
          },
          {
            label: "Mastered",
            value: masteredCount,
            icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          },
          {
            label: "Learning",
            value: learningCount,
            icon: <Sparkles className="w-4 h-4 text-blue-600" />,
          },
          {
            label: "Est. Time",
            value: `~${estMinutes}m`,
            icon: <Clock className="w-4 h-4 text-secondary" />,
          },
        ].map(({ label, value, icon }) => (
          <Card key={label} className="border border-border bg-card">
            <CardContent className="p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                {icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-semibold text-foreground text-sm">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Start Review CTA */}
      {totalCards > 0 && (
        <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm">
              Ready to review {totalCards} cards?
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Keyboard shortcuts: Space to flip · 1=Hard · 2=Good · 3=Easy
            </p>
          </div>
          <Link
            to="/flashcards/$topicId/review"
            params={{ topicId: topicId.toString() }}
            data-ocid="flashcard_deck.start_review.button"
          >
            <Button className="flex-shrink-0">
              <PlayCircle className="w-4 h-4 mr-2" />
              Start Review
            </Button>
          </Link>
        </div>
      )}

      {/* Progress bar */}
      {totalCards > 0 && (
        <div className="mb-5">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Progress</span>
            <span>
              {masteredCount} / {totalCards} mastered
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="h-2 rounded-full bg-emerald-500 transition-all duration-700"
              style={{
                width: `${totalCards > 0 ? (masteredCount / totalCards) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Card Grid */}
      {cardList.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center min-h-64 text-center"
          data-ocid="flashcard_deck.empty_state"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 text-2xl">
            🃏
          </div>
          <h2 className="font-display font-semibold text-foreground text-xl mb-2">
            No flashcards yet
          </h2>
          <p className="text-muted-foreground text-sm mb-5 max-w-xs">
            Flashcards for this topic will appear here once they're created.
          </p>
          <Link to="/flashcards" data-ocid="flashcard_deck.back_empty.link">
            <Button variant="outline">Browse Other Decks</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cardList.map((card, i) => {
            const status = getCardStatus(i);
            return (
              <Card
                key={card.id.toString()}
                className="border border-border bg-card hover:shadow-md transition-all duration-200 group cursor-default"
                data-ocid={`flashcard_deck.card.item.${i + 1}`}
              >
                <CardContent className="p-4 h-full flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="w-6 h-6 rounded-md bg-muted text-muted-foreground text-xs flex items-center justify-center font-semibold flex-shrink-0">
                      {i + 1}
                    </span>
                    <StatusBadge status={status} />
                  </div>
                  <p className="text-sm font-medium text-foreground leading-snug flex-1 line-clamp-3 min-h-[3rem]">
                    {card.front}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed border-t border-border pt-2">
                    {card.back}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Bottom CTA */}
      {cardList.length > 6 && (
        <div className="mt-8 flex justify-center">
          <Link
            to="/flashcards/$topicId/review"
            params={{ topicId: topicId.toString() }}
            data-ocid="flashcard_deck.bottom_review.button"
          >
            <Button size="lg">
              <Brain className="w-5 h-5 mr-2" />
              Start Review Session ({newCount + learningCount} remaining)
            </Button>
          </Link>
        </div>
      )}
    </Layout>
  );
}

// ─── Subject Topic Section ────────────────────────────────────────────────────

function SubjectFlashcardSection({
  subjectId,
  subjectName,
}: { subjectId: bigint; subjectName: SubjectName }) {
  const { data: topics } = useTopics(subjectId);
  const meta = SUBJECT_META[subjectName];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{meta.icon}</span>
        <h2 className="font-display font-semibold text-foreground">
          {meta.label}
        </h2>
        <Badge variant="outline" className="ml-auto">
          {topics?.length ?? 0} topics
        </Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(topics ?? []).slice(0, 6).map((topic, i) => (
          <Link
            key={topic.id.toString()}
            to="/flashcards/$topicId"
            params={{ topicId: topic.id.toString() }}
            data-ocid={`flashcards.topic.item.${i + 1}`}
          >
            <Card className="border border-border bg-card hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {topic.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {topic.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FlashcardDeckPage() {
  const params = useParams({ strict: false });
  const topicIdParam = (params as Record<string, string>).topicId;

  // If a topic is selected, show the topic deck view
  if (topicIdParam) {
    return <TopicDeckView topicId={BigInt(topicIdParam)} />;
  }

  return <AllDecksView />;
}

function AllDecksView() {
  const { data: subjects, isLoading } = useSubjects();
  const { data: dueCards } = useDueFlashcards();
  const dueCount = dueCards?.length ?? 0;

  if (isLoading)
    return (
      <Layout title="Flashcards">
        <PageLoader />
      </Layout>
    );

  return (
    <Layout
      title="Flashcards"
      subtitle="Spaced-repetition learning"
      actions={
        dueCount > 0 ? (
          <Link
            to="/flashcards/review"
            data-ocid="flashcards.review_due.button"
          >
            <Button variant="default">
              <Brain className="w-4 h-4 mr-2" />
              Review {dueCount} Due
            </Button>
          </Link>
        ) : undefined
      }
    >
      {dueCount > 0 && (
        <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground text-sm">
              You have {dueCount} flashcards due for review
            </p>
            <p className="text-xs text-muted-foreground">
              Regular review improves long-term retention.
            </p>
          </div>
          <Link
            to="/flashcards/review"
            data-ocid="flashcards.due_banner.button"
          >
            <Button size="sm" variant="default">
              Review Now
            </Button>
          </Link>
        </div>
      )}

      {(subjects ?? []).map((subject) => (
        <SubjectFlashcardSection
          key={subject.id.toString()}
          subjectId={subject.id}
          subjectName={subject.name as SubjectName}
        />
      ))}
    </Layout>
  );
}

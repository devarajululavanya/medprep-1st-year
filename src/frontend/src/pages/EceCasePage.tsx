import { Layout } from "@/components/Layout";
import { PageLoader } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCases } from "@/hooks/useBackend";
import type { Difficulty, SubjectName } from "@/types";
import { SUBJECT_META } from "@/types";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Filter, Stethoscope } from "lucide-react";
import { useState } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; className: string }
> = {
  easy: {
    label: "Easy",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  medium: {
    label: "Medium",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  hard: { label: "Hard", className: "bg-red-100 text-red-700 border-red-200" },
};

// Extended case metadata with subject info seeded inline
const CASE_SUBJECT_MAP: Record<string, SubjectName> = {
  "1": "physiology",
  "2": "biochemistry",
  "3": "physiology",
  "4": "anatomy",
  "5": "biochemistry",
  "6": "anatomy",
  "7": "physiology",
  "8": "biochemistry",
};

const SUBJECT_FILTERS: { value: "all" | SubjectName; label: string }[] = [
  { value: "all", label: "All Subjects" },
  { value: "anatomy", label: "Anatomy" },
  { value: "physiology", label: "Physiology" },
  { value: "biochemistry", label: "Biochemistry" },
];

const DIFFICULTY_FILTERS: { value: "all" | Difficulty; label: string }[] = [
  { value: "all", label: "All" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCompletedCases(): Set<string> {
  try {
    const raw = localStorage.getItem("ece_completed") ?? "[]";
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function getCaseSubject(caseId: string): SubjectName {
  return CASE_SUBJECT_MAP[caseId] ?? "physiology";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EceCasePage() {
  const { data: cases, isLoading } = useCases();
  const [subjectFilter, setSubjectFilter] = useState<"all" | SubjectName>(
    "all",
  );
  const [diffFilter, setDiffFilter] = useState<"all" | Difficulty>("all");

  const completed = getCompletedCases();

  if (isLoading)
    return (
      <Layout title="ECE Cases">
        <PageLoader />
      </Layout>
    );

  const filtered = (cases ?? []).filter((c) => {
    const subjectMatch =
      subjectFilter === "all" ||
      getCaseSubject(c.id.toString()) === subjectFilter;
    const diffMatch = diffFilter === "all" || c.difficulty === diffFilter;
    return subjectMatch && diffMatch;
  });

  const totalCount = cases?.length ?? 0;
  const completedCount = (cases ?? []).filter((c) =>
    completed.has(c.id.toString()),
  ).length;

  return (
    <Layout title="Clinical Cases" subtitle="Early Clinical Exposure">
      {/* Stats strip */}
      <div className="flex items-center gap-6 mb-6 p-4 rounded-xl bg-card border border-border shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Cases</p>
            <p className="font-display font-bold text-foreground text-lg leading-tight">
              {totalCount}
            </p>
          </div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="font-display font-bold text-foreground text-lg leading-tight">
              {completedCount}
            </p>
          </div>
        </div>
        <div className="ml-auto hidden sm:block">
          <p className="text-xs text-muted-foreground mb-1">Progress</p>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-smooth"
                style={{
                  width:
                    totalCount > 0
                      ? `${(completedCount / totalCount) * 100}%`
                      : "0%",
                }}
              />
            </div>
            <span className="text-xs font-medium text-foreground">
              {totalCount > 0
                ? Math.round((completedCount / totalCount) * 100)
                : 0}
              %
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        className="flex flex-wrap items-center gap-3 mb-5"
        data-ocid="cases.filters"
      >
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </div>
        {/* Subject tabs */}
        <div
          className="flex items-center gap-1 bg-muted/60 rounded-lg p-1"
          data-ocid="cases.subject.filter"
        >
          {SUBJECT_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setSubjectFilter(f.value)}
              data-ocid={`cases.subject.tab.${f.value}`}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-smooth ${
                subjectFilter === f.value
                  ? "bg-card text-foreground shadow-subtle"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {/* Difficulty pills */}
        <div
          className="flex items-center gap-1.5"
          data-ocid="cases.difficulty.filter"
        >
          {DIFFICULTY_FILTERS.map((f) => (
            <Button
              key={f.value}
              variant="outline"
              size="sm"
              onClick={() => setDiffFilter(f.value)}
              data-ocid={`cases.difficulty.tab.${f.value}`}
              className={`h-7 px-3 text-xs transition-smooth ${
                diffFilter === f.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : ""
              }`}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Cases grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        data-ocid="cases.list"
      >
        {filtered.map((c, i) => {
          const diff = DIFFICULTY_CONFIG[c.difficulty as Difficulty];
          const subject = getCaseSubject(c.id.toString());
          const subjectMeta = SUBJECT_META[subject];
          const isCompleted = completed.has(c.id.toString());
          const snippet =
            c.presentation.slice(0, 150) +
            (c.presentation.length > 150 ? "…" : "");

          return (
            <Link
              key={c.id.toString()}
              to="/cases/$caseId"
              params={{ caseId: c.id.toString() }}
              data-ocid={`cases.item.${i + 1}`}
              className="group block"
            >
              <Card className="border border-border bg-card shadow-subtle hover:shadow-elevated hover:border-primary/40 transition-smooth cursor-pointer h-full">
                <CardContent className="p-5 flex flex-col h-full">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 text-base">
                      {subjectMeta.icon}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isCompleted && (
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      )}
                      <Badge className={`text-xs border ${diff.className}`}>
                        {diff.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors">
                    {c.title}
                  </h3>

                  {/* Snippet */}
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-3 flex-1 leading-relaxed">
                    {snippet}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium ${subjectMeta.color}`}
                      >
                        {subjectMeta.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        · {c.questions.length}Q · {c.learningPoints.length} LPs
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-smooth" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}

        {filtered.length === 0 && (
          <div
            className="col-span-full text-center py-16 rounded-xl bg-muted/30 border border-dashed border-border"
            data-ocid="cases.empty_state"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-display font-semibold text-foreground mb-1">
              No matching cases
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your subject or difficulty filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSubjectFilter("all");
                setDiffFilter("all");
              }}
              data-ocid="cases.clear_filters.button"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}

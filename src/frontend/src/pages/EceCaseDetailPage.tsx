import { Layout } from "@/components/Layout";
import { PageLoader } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useCase } from "@/hooks/useBackend";
import type { Difficulty, SubjectName } from "@/types";
import { SUBJECT_META } from "@/types";
import { Link, useParams } from "@tanstack/react-router";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  FileText,
  Lightbulb,
  Microscope,
  Stethoscope,
  Trophy,
} from "lucide-react";
import { useEffect, useState } from "react";

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

// ─── Clinical note parser ─────────────────────────────────────────────────────

interface ClinicalSection {
  heading: string;
  body: string;
  icon: React.ReactNode;
}

// Heuristic: split presentation into clinical note sections
function parsePresentationSections(text: string): ClinicalSection[] | null {
  // Try to detect structured notes with known headers
  const knownHeaders = [
    { key: "Chief Complaint", icon: <Stethoscope className="w-3.5 h-3.5" /> },
    { key: "History", icon: <BookOpen className="w-3.5 h-3.5" /> },
    { key: "Examination", icon: <FileText className="w-3.5 h-3.5" /> },
    { key: "Labs", icon: <Microscope className="w-3.5 h-3.5" /> },
    { key: "Investigations", icon: <Microscope className="w-3.5 h-3.5" /> },
  ];

  const hasHeaders = knownHeaders.some((h) => text.includes(`${h.key}:`));
  if (!hasHeaders) return null;

  const sections: ClinicalSection[] = [];
  const remaining = { text };

  for (let ki = 0; ki < knownHeaders.length; ki++) {
    const h = knownHeaders[ki];
    const startTag = `${h.key}:`;
    const idx = remaining.text.indexOf(startTag);
    if (idx === -1) continue;

    // find end: next known header or end of string
    let endIdx = remaining.text.length;
    for (let kj = ki + 1; kj < knownHeaders.length; kj++) {
      const nextIdx = remaining.text.indexOf(`${knownHeaders[kj].key}:`, idx);
      if (nextIdx !== -1 && nextIdx < endIdx) endIdx = nextIdx;
    }

    const body = remaining.text.slice(idx + startTag.length, endIdx).trim();
    sections.push({ heading: h.key, body, icon: h.icon });
  }
  return sections.length ? sections : null;
}

// Synthesise "clinical note" sections from free text
function buildClinicalSections(text: string): ClinicalSection[] {
  // Split by sentences to form narrative sections
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const mid = Math.ceil(sentences.length / 2);

  return [
    {
      heading: "Presenting Complaint & History",
      icon: <Stethoscope className="w-3.5 h-3.5" />,
      body: sentences.slice(0, mid).join(" "),
    },
    {
      heading: "Examination & Investigations",
      icon: <Microscope className="w-3.5 h-3.5" />,
      body: sentences.slice(mid).join(" "),
    },
  ];
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

function getCompletedCases(): Set<string> {
  try {
    const raw = localStorage.getItem("ece_completed") ?? "[]";
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function markCaseCompleted(caseId: string) {
  const set = getCompletedCases();
  set.add(caseId);
  localStorage.setItem("ece_completed", JSON.stringify([...set]));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EceCaseDetailPage() {
  const params = useParams({ strict: false });
  const caseId = BigInt((params as Record<string, string>).caseId ?? "1");
  const caseIdStr = caseId.toString();

  const { data: eceCase, isLoading } = useCase(caseId);

  const [answers, setAnswers] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Check initial completion state
  useEffect(() => {
    if (eceCase) {
      setIsCompleted(getCompletedCases().has(caseIdStr));
      setAnswers(new Array(eceCase.questions.length).fill(""));
      setRevealed(new Array(eceCase.questions.length).fill(false));
    }
  }, [eceCase, caseIdStr]);

  // Auto-complete when all questions revealed
  useEffect(() => {
    if (!eceCase || eceCase.questions.length === 0) return;
    const allRevealed = revealed
      .slice(0, eceCase.questions.length)
      .every(Boolean);
    if (allRevealed && revealed.length === eceCase.questions.length) {
      markCaseCompleted(caseIdStr);
      setIsCompleted(true);
    }
  }, [revealed, eceCase, caseIdStr]);

  if (isLoading)
    return (
      <Layout title="Clinical Case">
        <PageLoader />
      </Layout>
    );

  if (!eceCase)
    return (
      <Layout title="Not Found">
        <div
          className="text-center py-16"
          data-ocid="case.not_found.error_state"
        >
          <p className="text-muted-foreground">Case not found.</p>
          <Link to="/cases">
            <Button variant="outline" size="sm" className="mt-4">
              Back to Cases
            </Button>
          </Link>
        </div>
      </Layout>
    );

  const diff = DIFFICULTY_CONFIG[eceCase.difficulty as Difficulty];
  const subject = CASE_SUBJECT_MAP[caseIdStr] ?? "physiology";
  const subjectMeta = SUBJECT_META[subject];
  const answeredCount = revealed.filter(Boolean).length;
  const totalQ = eceCase.questions.length;

  const clinicalSections =
    parsePresentationSections(eceCase.presentation) ??
    buildClinicalSections(eceCase.presentation);

  function toggleReveal(i: number) {
    setRevealed((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  }

  function revealAll() {
    setRevealed(new Array(totalQ).fill(true));
  }

  return (
    <Layout
      title={eceCase.title}
      subtitle="Early Clinical Exposure"
      actions={
        <Link to="/cases" data-ocid="case.back.link">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="w-4 h-4 mr-1" /> Cases
          </Button>
        </Link>
      }
    >
      <div className="max-w-2xl space-y-5">
        {/* Header badges */}
        <div
          className="flex flex-wrap items-center gap-2"
          data-ocid="case.header.section"
        >
          <Badge className={`text-xs border ${diff.className}`}>
            {diff.label}
          </Badge>
          <Badge
            variant="outline"
            className={`text-xs ${subjectMeta.color} border-current`}
          >
            {subjectMeta.icon} {subjectMeta.label}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {totalQ} Question{totalQ !== 1 ? "s" : ""}
          </Badge>
          {isCompleted && (
            <Badge className="text-xs bg-green-100 text-green-700 border-green-200 border gap-1">
              <CheckCircle2 className="w-3 h-3" /> Completed
            </Badge>
          )}
        </div>

        {/* Completion banner */}
        {isCompleted && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200"
            data-ocid="case.completed.success_state"
          >
            <Trophy className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800 text-sm">
                Case Completed!
              </p>
              <p className="text-xs text-green-700">
                You've reviewed all questions for this case.
              </p>
            </div>
          </div>
        )}

        {/* ── Clinical Presentation (styled as patient chart) ── */}
        <Card
          className="border border-border bg-card shadow-subtle overflow-hidden"
          data-ocid="case.presentation.card"
        >
          {/* Chart header */}
          <div className="bg-primary px-5 py-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary-foreground/80" />
            <span className="font-display font-semibold text-primary-foreground text-sm tracking-wide">
              PATIENT CHART
            </span>
            <span className="ml-auto text-xs text-primary-foreground/60 font-mono">
              ID: ECE-{caseIdStr.padStart(4, "0")}
            </span>
          </div>

          <CardContent className="p-0 divide-y divide-border">
            {clinicalSections.map((section) => (
              <div key={`section-${section.heading}`} className="px-5 py-4">
                <div className="flex items-center gap-1.5 text-primary font-semibold text-xs uppercase tracking-wider mb-2">
                  {section.icon}
                  <span>{section.heading}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {section.body}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Progress bar ── */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-smooth"
              style={{
                width: totalQ > 0 ? `${(answeredCount / totalQ) * 100}%` : "0%",
              }}
            />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {answeredCount}/{totalQ} answered
          </span>
        </div>

        {/* ── Questions ── */}
        <div className="space-y-4" data-ocid="case.questions.section">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-foreground">
              Questions
            </h2>
            {answeredCount < totalQ && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={revealAll}
                data-ocid="case.reveal_all.button"
              >
                Reveal All
              </Button>
            )}
          </div>

          {eceCase.questions.map((q, i) => (
            <Card
              key={`q-${caseIdStr}-${q.text.slice(0, 20)}`}
              data-ocid={`case.question.item.${i + 1}`}
              className={`border bg-card shadow-subtle transition-smooth ${
                revealed[i] ? "border-primary/30" : "border-border"
              }`}
            >
              <CardContent className="p-5">
                {/* Question number + text */}
                <div className="flex items-start gap-2.5 mb-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                      revealed[i]
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <p className="font-medium text-foreground text-sm leading-relaxed">
                    {q.text}
                  </p>
                </div>

                {/* Answer textarea */}
                <Textarea
                  placeholder="Write your answer here before revealing the model answer…"
                  value={answers[i] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => {
                      const next = [...prev];
                      next[i] = e.target.value;
                      return next;
                    })
                  }
                  className="min-h-24 text-sm mb-3 resize-none bg-muted/30 border-input focus:border-primary"
                  data-ocid={`case.answer.textarea.${i + 1}`}
                />

                {/* Reveal / Answer */}
                {!revealed[i] ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleReveal(i)}
                    data-ocid={`case.reveal.button.${i + 1}`}
                    className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground transition-smooth"
                  >
                    Reveal Model Answer
                  </Button>
                ) : (
                  <div className="rounded-lg overflow-hidden border border-primary/20">
                    <div className="bg-primary/8 px-4 py-2 flex items-center gap-1.5 border-b border-primary/20">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-semibold text-primary">
                        Model Answer
                      </span>
                    </div>
                    <div className="px-4 py-3 bg-card">
                      <p className="text-sm text-foreground leading-relaxed">
                        {q.modelAnswer}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Learning Points ── */}
        <Card
          className="border border-border bg-card shadow-subtle"
          data-ocid="case.learning_points.section"
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-display font-semibold text-foreground text-sm">
                Learning Points
              </h3>
              <Badge variant="outline" className="text-xs ml-auto">
                {eceCase.learningPoints.length}
              </Badge>
            </div>

            <ul className="space-y-3" data-ocid="case.learning_points.list">
              {eceCase.learningPoints.map((lp, i) => (
                <li
                  key={`lp-${caseIdStr}-${lp.slice(0, 20)}`}
                  className="flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {lp}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* ── Bottom navigation ── */}
        <div className="flex items-center justify-between pt-2 pb-6">
          <Link to="/cases" data-ocid="case.footer.back.link">
            <Button variant="outline" size="sm">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Cases
            </Button>
          </Link>
          {!isCompleted && answeredCount === totalQ && (
            <Button
              size="sm"
              onClick={() => {
                markCaseCompleted(caseIdStr);
                setIsCompleted(true);
              }}
              data-ocid="case.mark_complete.button"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark as Completed
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}

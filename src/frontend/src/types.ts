// ─── Domain Types ────────────────────────────────────────────────────────────

export type SubjectName = "anatomy" | "physiology" | "biochemistry";
export type FlashcardStatus = "new" | "learning" | "mastered";
export type Difficulty = "easy" | "medium" | "hard";
export type FlashcardRating = "easy" | "good" | "hard";

export interface Subject {
  id: bigint;
  name: SubjectName;
  description: string;
  topicCount: bigint;
}

export interface Topic {
  id: bigint;
  subjectId: bigint;
  title: string;
  description: string;
  orderIndex: bigint;
}

export interface Question {
  id: bigint;
  topicId: bigint;
  text: string;
  options: string[];
  correctIndex: bigint;
  explanation: string;
  isFlagged: boolean;
}

export interface Flashcard {
  id: bigint;
  topicId: bigint;
  front: string;
  back: string;
}

export interface FlashcardProgress {
  flashcardId: bigint;
  status: FlashcardStatus;
  easeFactor: number;
  intervalDays: bigint;
  dueDate: bigint;
  reviewCount: bigint;
}

export interface QuizResult {
  quizId: bigint;
  score: bigint;
  totalQuestions: bigint;
  percentage: number;
  correctAnswers: boolean[];
  completedAt: bigint;
}

export interface EceCaseQuestion {
  text: string;
  modelAnswer: string;
}

export interface EceCase {
  id: bigint;
  title: string;
  presentation: string;
  questions: EceCaseQuestion[];
  learningPoints: string[];
  difficulty: Difficulty;
}

export interface SubjectProgress {
  subjectId: bigint;
  masteryPercent: number;
  totalStudyMinutes: bigint;
  topicsStudied: bigint;
  quizzesTaken: bigint;
  flashcardsReviewed: bigint;
}

export interface UserProgress {
  subjectProgress: SubjectProgress[];
  totalStudyMinutes: bigint;
  streakDays: bigint;
  lastStudyDate: bigint | null;
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

export const SUBJECT_META: Record<
  SubjectName,
  { label: string; color: string; icon: string }
> = {
  anatomy: { label: "Anatomy", color: "text-blue-600", icon: "🦴" },
  physiology: { label: "Physiology", color: "text-teal-600", icon: "🫁" },
  biochemistry: { label: "Biochemistry", color: "text-orange-600", icon: "🧬" },
};

export const SUBJECT_BG: Record<SubjectName, string> = {
  anatomy: "bg-blue-50 border-blue-200",
  physiology: "bg-teal-50 border-teal-200",
  biochemistry: "bg-orange-50 border-orange-200",
};

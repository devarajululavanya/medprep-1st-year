import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CaseQuestion {
    text: string;
    modelAnswer: string;
}
export type Timestamp = bigint;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface EceCase {
    id: CaseId;
    title: string;
    subjectTags: Array<SubjectId>;
    difficulty: DifficultyLevel;
    learningPoints: Array<string>;
    questions: Array<CaseQuestion>;
    presentation: string;
}
export interface Quiz {
    id: QuizId;
    status: QuizStatus;
    createdAt: Timestamp;
    questionIds: Array<QuestionId>;
    topicId: TopicId;
}
export type QuestionId = bigint;
export interface QuizResult {
    completedAt: Timestamp;
    score: bigint;
    totalQuestions: bigint;
    correctAnswers: Array<boolean>;
    quizId: QuizId;
    percentage: number;
}
export interface SubjectProgress {
    topicsStudied: bigint;
    masteryPercent: number;
    totalStudyMinutes: bigint;
    quizzesTaken: bigint;
    subjectId: SubjectId;
    flashcardsReviewed: bigint;
}
export interface UserProgress {
    streakDays: bigint;
    lastStudyDate?: Timestamp;
    totalStudyMinutes: bigint;
    subjectProgress: Array<SubjectProgress>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type TopicId = bigint;
export type FlashcardId = bigint;
export type CaseId = bigint;
export interface QuizAttempt {
    completedAt: Timestamp;
    answers: Array<bigint>;
    score: bigint;
    totalQuestions: bigint;
    quizId: QuizId;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Flashcard {
    id: FlashcardId;
    front: string;
    back: string;
    topicId: TopicId;
}
export interface Topic {
    id: TopicId;
    title: string;
    description: string;
    subjectId: SubjectId;
    orderIndex: bigint;
}
export interface Question {
    id: QuestionId;
    source: Variant_manual_aiGenerated;
    correctIndex: bigint;
    explanation: string;
    text: string;
    options: Array<string>;
    isFlagged: boolean;
    topicId: TopicId;
}
export type SubjectId = bigint;
export interface Subject {
    id: SubjectId;
    topicCount: bigint;
    name: SubjectName;
    description: string;
}
export type QuizId = bigint;
export enum DifficultyLevel {
    easy = "easy",
    hard = "hard",
    medium = "medium"
}
export enum QuizStatus {
    active = "active",
    completed = "completed"
}
export enum ReviewRating {
    easy = "easy",
    good = "good",
    hard = "hard"
}
export enum SubjectName {
    physiology = "physiology",
    anatomy = "anatomy",
    biochemistry = "biochemistry"
}
export enum Variant_manual_aiGenerated {
    manual = "manual",
    aiGenerated = "aiGenerated"
}
export interface backendInterface {
    createQuiz(topicId: TopicId, questionCount: bigint): Promise<Quiz>;
    generateQuestionsForTopic(topicId: TopicId): Promise<Array<Question>>;
    getCase(id: CaseId): Promise<EceCase | null>;
    getCases(subjectId: SubjectId | null): Promise<Array<EceCase>>;
    getDueFlashcards(): Promise<Array<Flashcard>>;
    getFlashcards(topicId: TopicId): Promise<Array<Flashcard>>;
    getQuestion(id: QuestionId): Promise<Question | null>;
    getQuestions(topicId: TopicId): Promise<Array<Question>>;
    getQuizHistory(): Promise<Array<QuizAttempt>>;
    getQuizResult(quizId: QuizId): Promise<QuizResult | null>;
    getSubjects(): Promise<Array<Subject>>;
    getTopic(id: TopicId): Promise<Topic | null>;
    getTopics(subjectId: SubjectId): Promise<Array<Topic>>;
    getUserProgress(): Promise<UserProgress>;
    markQuestionFlagged(questionId: QuestionId): Promise<void>;
    recordStudySession(subjectId: SubjectId, durationMinutes: bigint): Promise<void>;
    reviewFlashcard(cardId: FlashcardId, rating: ReviewRating): Promise<void>;
    submitCaseAnswer(caseId: CaseId, questionIndex: bigint, answer: string): Promise<void>;
    submitQuiz(quizId: QuizId, answers: Array<bigint>): Promise<QuizResult>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}

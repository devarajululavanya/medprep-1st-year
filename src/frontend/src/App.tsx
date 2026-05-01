import { ErrorBoundary } from "@/components/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

// Pages
import DashboardPage from "@/pages/DashboardPage";
import EceCaseDetailPage from "@/pages/EceCaseDetailPage";
import EceCasePage from "@/pages/EceCasePage";
import FlashcardDeckPage from "@/pages/FlashcardDeckPage";
import FlashcardReviewPage from "@/pages/FlashcardReviewPage";
import ProgressPage from "@/pages/ProgressPage";
import QuestionBankPage from "@/pages/QuestionBankPage";
import QuizPage from "@/pages/QuizPage";
import QuizResultPage from "@/pages/QuizResultPage";
import SubjectDetailPage from "@/pages/SubjectDetailPage";
import SubjectListPage from "@/pages/SubjectListPage";
import TopicDetailPage from "@/pages/TopicDetailPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

// ─── Router ───────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});
const subjectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/subjects",
  component: SubjectListPage,
});
const subjectDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/subjects/$subjectId",
  component: SubjectDetailPage,
});
const topicDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/topics/$topicId",
  component: TopicDetailPage,
});
const questionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/questions/$topicId",
  component: QuestionBankPage,
});
const flashcardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/flashcards",
  component: FlashcardDeckPage,
});
const flashcardTopicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/flashcards/$topicId",
  component: FlashcardDeckPage,
});
const flashcardReviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/flashcards/review",
  component: FlashcardReviewPage,
});
const flashcardTopicReviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/flashcards/$topicId/review",
  component: FlashcardReviewPage,
});
const quizRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/quiz/$topicId/$count",
  component: QuizPage,
});
const quizResultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/quiz-history",
  component: QuizResultPage,
});
const casesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cases",
  component: EceCasePage,
});
const caseDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cases/$caseId",
  component: EceCaseDetailPage,
});
const progressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/progress",
  component: ProgressPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  subjectsRoute,
  subjectDetailRoute,
  topicDetailRoute,
  questionsRoute,
  flashcardsRoute,
  flashcardTopicRoute,
  flashcardReviewRoute,
  flashcardTopicReviewRoute,
  quizRoute,
  quizResultRoute,
  casesRoute,
  caseDetailRoute,
  progressRoute,
]);

const router = createRouter({ routeTree, defaultPreload: "intent" });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

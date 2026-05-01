import List "mo:core/List";
import Map "mo:core/Map";

import CTypes "types/curriculum";
import QTypes "types/questions";
import FTypes "types/flashcards";
import QzTypes "types/quizzes";
import ETypes "types/ece";
import PTypes "types/progress";

import CurriculumLib "lib/curriculum";
import QuestionsLib "lib/questions";
import FlashcardsLib "lib/flashcards";
import EceLib "lib/ece";

import CurriculumApi "mixins/curriculum-api";
import QuestionsApi "mixins/questions-api";
import FlashcardsApi "mixins/flashcards-api";
import QuizzesApi "mixins/quizzes-api";
import EceApi "mixins/ece-api";
import ProgressApi "mixins/progress-api";

actor {
  // --- Curriculum state ---
  let subjects = List.empty<CTypes.Subject>();
  let topics = List.empty<CTypes.Topic>();

  // --- Question bank state ---
  let questions = List.empty<QTypes.Question>();

  // --- Flashcard state ---
  let flashcards = List.empty<FTypes.Flashcard>();
  let flashcardProgress = Map.empty<Principal, List.List<FTypes.FlashcardProgress>>();

  // --- Quiz state ---
  let quizzes = List.empty<QzTypes.Quiz>();
  let quizAttempts = Map.empty<Principal, List.List<QzTypes.QuizAttempt>>();

  // --- ECE case state ---
  let eceCases = List.empty<ETypes.EceCase>();
  let caseSubmissions = Map.empty<Principal, List.List<ETypes.CaseSubmission>>();

  // --- Progress state ---
  let userProgressMap = Map.empty<Principal, PTypes.UserProgressState>();

  // --- Seed sample content on first init ---
  CurriculumLib.seedSubjects(subjects);
  CurriculumLib.seedTopics(topics);
  QuestionsLib.seedQuestions(questions);
  FlashcardsLib.seedFlashcards(flashcards);
  EceLib.seedCases(eceCases);

  // --- Mixins ---
  include CurriculumApi(subjects, topics);
  include QuestionsApi(questions, topics);
  include FlashcardsApi(flashcards, flashcardProgress);
  include QuizzesApi(quizzes, quizAttempts, questions);
  include EceApi(eceCases, caseSubmissions);
  include ProgressApi(userProgressMap, subjects);
};

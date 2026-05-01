import List "mo:core/List";
import Map "mo:core/Map";
import QzTypes "../types/quizzes";
import QTypes "../types/questions";
import CTypes "../types/curriculum";
import QzLib "../lib/quizzes";
import Time "mo:core/Time";

mixin (
  quizzes : List.List<QzTypes.Quiz>,
  quizAttempts : Map.Map<Principal, List.List<QzTypes.QuizAttempt>>,
  questions : List.List<QTypes.Question>,
) {
  public shared ({ caller = _ }) func createQuiz(topicId : CTypes.TopicId, questionCount : Nat) : async QzTypes.Quiz {
    QzLib.createQuiz(quizzes, questions, topicId, questionCount, Time.now())
  };

  public shared ({ caller }) func submitQuiz(quizId : QzTypes.QuizId, answers : [Nat]) : async QzTypes.QuizResult {
    QzLib.submitQuiz(quizzes, quizAttempts, questions, caller, quizId, answers, Time.now())
  };

  public query ({ caller }) func getQuizResult(quizId : QzTypes.QuizId) : async ?QzTypes.QuizResult {
    QzLib.getQuizResult(quizzes, questions, quizAttempts, caller, quizId)
  };

  public query ({ caller }) func getQuizHistory() : async [QzTypes.QuizAttempt] {
    QzLib.getQuizHistory(quizAttempts, caller)
  };
};

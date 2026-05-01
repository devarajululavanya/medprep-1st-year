import List "mo:core/List";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import QzTypes "../types/quizzes";
import QTypes "../types/questions";
import CTypes "../types/curriculum";
import Common "../types/common";

module {
  public func nextId(quizzes : List.List<QzTypes.Quiz>) : Nat {
    quizzes.size() + 1
  };

  public func createQuiz(
    quizzes : List.List<QzTypes.Quiz>,
    questions : List.List<QTypes.Question>,
    topicId : CTypes.TopicId,
    questionCount : Nat,
    now : Common.Timestamp,
  ) : QzTypes.Quiz {
    let topicQs = questions.filter(func(q) { q.topicId == topicId }).toArray();
    let available = topicQs.size();
    let count = if (questionCount > available) available else questionCount;

    let selected : [QTypes.QuestionId] = if (available == 0 or count == 0) {
      []
    } else {
      let seed = Int.abs(now) % available;
      let indices = List.empty<Nat>();
      var idx = seed;
      var attempt = 0;
      while (indices.size() < count and attempt < available * 2) {
        if (not indices.contains(idx)) {
          indices.add(idx);
        };
        idx := (idx + 3) % available;
        attempt += 1;
      };
      // Fill sequentially if still short
      var i = 0;
      while (indices.size() < count and i < available) {
        if (not indices.contains(i)) {
          indices.add(i);
        };
        i += 1;
      };
      indices.map<Nat, QTypes.QuestionId>(func(j) { topicQs[j].id }).toArray()
    };

    let id = nextId(quizzes);
    let quiz : QzTypes.Quiz = {
      id;
      topicId;
      questionIds = selected;
      status = #active;
      createdAt = now;
    };
    quizzes.add(quiz);
    quiz
  };

  // Compute per-question correctness and total score from answers
  func scoreAnswers(
    questions : List.List<QTypes.Question>,
    qIds : [QTypes.QuestionId],
    answers : [Nat],
  ) : { score : Nat; correctAnswers : [Bool] } {
    let totalQuestions = qIds.size();
    let answersLen = answers.size();
    let correctList = List.empty<Bool>();
    var score = 0;
    var i = 0;
    while (i < totalQuestions) {
      let qId = qIds[i];
      let given = if (i < answersLen) answers[i] else totalQuestions + 99;
      let correct = switch (questions.find(func(q) { q.id == qId })) {
        case null false;
        case (?q) q.correctIndex == given;
      };
      if (correct) score += 1;
      correctList.add(correct);
      i += 1;
    };
    { score; correctAnswers = correctList.toArray() }
  };

  public func submitQuiz(
    quizzes : List.List<QzTypes.Quiz>,
    attempts : Map.Map<Principal, List.List<QzTypes.QuizAttempt>>,
    questions : List.List<QTypes.Question>,
    caller : Principal,
    quizId : QzTypes.QuizId,
    answers : [Nat],
    now : Common.Timestamp,
  ) : QzTypes.QuizResult {
    let quiz = switch (quizzes.find(func(qz) { qz.id == quizId })) {
      case (?qz) qz;
      case null Runtime.trap("Quiz not found");
    };

    quizzes.mapInPlace(func(qz) {
      if (qz.id == quizId) { { qz with status = #completed } } else { qz }
    });

    let { score; correctAnswers } = scoreAnswers(questions, quiz.questionIds, answers);
    let totalQuestions = quiz.questionIds.size();
    let percentage : Float = if (totalQuestions == 0) 0.0
      else score.toFloat() / totalQuestions.toFloat() * 100.0;

    let attempt : QzTypes.QuizAttempt = {
      quizId;
      answers;
      score;
      totalQuestions;
      completedAt = now;
    };

    let userAttempts = switch (attempts.get(caller)) {
      case (?a) a;
      case null {
        let fresh = List.empty<QzTypes.QuizAttempt>();
        attempts.add(caller, fresh);
        fresh
      };
    };
    userAttempts.add(attempt);

    { quizId; score; totalQuestions; percentage; correctAnswers; completedAt = now }
  };

  public func getQuizResult(
    quizzes : List.List<QzTypes.Quiz>,
    questions : List.List<QTypes.Question>,
    attempts : Map.Map<Principal, List.List<QzTypes.QuizAttempt>>,
    caller : Principal,
    quizId : QzTypes.QuizId,
  ) : ?QzTypes.QuizResult {
    switch (attempts.get(caller)) {
      case null null;
      case (?userAttempts) {
        switch (userAttempts.find(func(a) { a.quizId == quizId })) {
          case null null;
          case (?a) {
            let quiz = switch (quizzes.find(func(qz) { qz.id == quizId })) {
              case (?qz) qz;
              case null return null;
            };
            let { score = _; correctAnswers } = scoreAnswers(questions, quiz.questionIds, a.answers);
            let totalQuestions = quiz.questionIds.size();
            let percentage : Float = if (totalQuestions == 0) 0.0
              else a.score.toFloat() / totalQuestions.toFloat() * 100.0;
            ?{ quizId; score = a.score; totalQuestions; percentage; correctAnswers; completedAt = a.completedAt }
          };
        }
      };
    }
  };

  public func getQuizHistory(
    attempts : Map.Map<Principal, List.List<QzTypes.QuizAttempt>>,
    caller : Principal,
  ) : [QzTypes.QuizAttempt] {
    switch (attempts.get(caller)) {
      case null [];
      case (?a) a.toArray();
    }
  };
};

import Common "common";
import Curriculum "curriculum";
import Questions "questions";

module {
  public type QuizId = Common.Id;

  public type QuizStatus = { #active; #completed };

  public type Quiz = {
    id : QuizId;
    topicId : Curriculum.TopicId;
    questionIds : [Questions.QuestionId];
    status : QuizStatus;
    createdAt : Common.Timestamp;
  };

  public type QuizAttempt = {
    quizId : QuizId;
    answers : [Nat]; // index of chosen option per question
    score : Nat;     // number correct
    totalQuestions : Nat;
    completedAt : Common.Timestamp;
  };

  public type QuizResult = {
    quizId : QuizId;
    score : Nat;
    totalQuestions : Nat;
    percentage : Float;
    correctAnswers : [Bool]; // per question
    completedAt : Common.Timestamp;
  };
};

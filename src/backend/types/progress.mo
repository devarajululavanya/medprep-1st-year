import Common "common";
import Curriculum "curriculum";
import Map "mo:core/Map";

module {
  public type SubjectProgress = {
    subjectId : Curriculum.SubjectId;
    masteryPercent : Float;
    totalStudyMinutes : Nat;
    topicsStudied : Nat;
    quizzesTaken : Nat;
    flashcardsReviewed : Nat;
  };

  public type UserProgress = {
    subjectProgress : [SubjectProgress];
    totalStudyMinutes : Nat;
    streakDays : Nat;
    lastStudyDate : ?Common.Timestamp;
  };

  // Internal mutable state stored per user
  public type UserProgressState = {
    var totalStudyMinutes : Nat;
    var streakDays : Nat;
    var lastStudyDate : ?Common.Timestamp;
    // subjectId -> study minutes (mutable map)
    subjectMinutes : Map.Map<Curriculum.SubjectId, Nat>;
    var quizzesTaken : Nat;
    var flashcardsReviewed : Nat;
  };
};

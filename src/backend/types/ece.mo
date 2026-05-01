import Common "common";
import Curriculum "curriculum";

module {
  public type CaseId = Common.Id;

  public type CaseQuestion = {
    text : Text;
    modelAnswer : Text;
  };

  public type EceCase = {
    id : CaseId;
    title : Text;
    presentation : Text;  // clinical presentation / vignette
    questions : [CaseQuestion];
    learningPoints : [Text];
    subjectTags : [Curriculum.SubjectId];
    difficulty : Common.DifficultyLevel;
  };

  public type CaseSubmission = {
    caseId : CaseId;
    questionIndex : Nat;
    userAnswer : Text;
    submittedAt : Common.Timestamp;
  };
};

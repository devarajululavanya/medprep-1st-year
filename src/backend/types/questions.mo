import Common "common";
import Curriculum "curriculum";

module {
  public type QuestionId = Common.Id;

  public type Question = {
    id : QuestionId;
    topicId : Curriculum.TopicId;
    text : Text;
    options : [Text];
    correctIndex : Nat;
    explanation : Text;
    isFlagged : Bool;
    source : { #manual; #aiGenerated };
  };
};

import Common "common";

module {
  public type SubjectId = Common.Id;
  public type TopicId = Common.Id;

  public type Subject = {
    id : SubjectId;
    name : Common.SubjectName;
    description : Text;
    topicCount : Nat;
  };

  public type Topic = {
    id : TopicId;
    subjectId : SubjectId;
    title : Text;
    description : Text;
    orderIndex : Nat;
  };
};

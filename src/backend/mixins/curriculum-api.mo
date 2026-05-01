import List "mo:core/List";
import CTypes "../types/curriculum";
import CLib "../lib/curriculum";

mixin (
  subjects : List.List<CTypes.Subject>,
  topics : List.List<CTypes.Topic>,
) {
  public query func getSubjects() : async [CTypes.Subject] {
    CLib.getSubjects(subjects)
  };

  public query func getTopics(subjectId : CTypes.SubjectId) : async [CTypes.Topic] {
    CLib.getTopics(topics, subjectId)
  };

  public query func getTopic(id : CTypes.TopicId) : async ?CTypes.Topic {
    CLib.getTopic(topics, id)
  };
};

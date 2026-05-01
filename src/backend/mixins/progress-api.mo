import Map "mo:core/Map";
import List "mo:core/List";
import PTypes "../types/progress";
import CTypes "../types/curriculum";
import PLib "../lib/progress";
import Time "mo:core/Time";

mixin (
  userProgressMap : Map.Map<Principal, PTypes.UserProgressState>,
  subjects : List.List<CTypes.Subject>,
) {
  public query ({ caller }) func getUserProgress() : async PTypes.UserProgress {
    PLib.getUserProgress(userProgressMap, caller, subjects)
  };

  public shared ({ caller }) func recordStudySession(subjectId : CTypes.SubjectId, durationMinutes : Nat) : async () {
    PLib.recordStudySession(userProgressMap, caller, subjectId, durationMinutes, Time.now())
  };
};

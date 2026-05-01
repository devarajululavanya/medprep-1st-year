import List "mo:core/List";
import Map "mo:core/Map";
import ETypes "../types/ece";
import CTypes "../types/curriculum";
import ELib "../lib/ece";
import Time "mo:core/Time";

mixin (
  eceCases : List.List<ETypes.EceCase>,
  caseSubmissions : Map.Map<Principal, List.List<ETypes.CaseSubmission>>,
) {
  public query func getCases(subjectId : ?CTypes.SubjectId) : async [ETypes.EceCase] {
    ELib.getCases(eceCases, subjectId)
  };

  public query func getCase(id : ETypes.CaseId) : async ?ETypes.EceCase {
    ELib.getCase(eceCases, id)
  };

  public shared ({ caller }) func submitCaseAnswer(caseId : ETypes.CaseId, questionIndex : Nat, answer : Text) : async () {
    ELib.submitCaseAnswer(caseSubmissions, caller, caseId, questionIndex, answer, Time.now())
  };
};

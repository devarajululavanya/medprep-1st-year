import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import PTypes "../types/progress";
import CTypes "../types/curriculum";
import Common "../types/common";

module {
  let nanosPerDay : Int = 86_400_000_000_000;

  func defaultProgress() : PTypes.UserProgressState {
    {
      var totalStudyMinutes = 0;
      var streakDays = 0;
      var lastStudyDate = null;
      subjectMinutes = Map.empty<CTypes.SubjectId, Nat>();
      var quizzesTaken = 0;
      var flashcardsReviewed = 0;
    }
  };

  public func getUserProgress(
    progressMap : Map.Map<Principal, PTypes.UserProgressState>,
    caller : Principal,
    subjects : List.List<CTypes.Subject>,
  ) : PTypes.UserProgress {
    let state = switch (progressMap.get(caller)) {
      case (?s) s;
      case null defaultProgress();
    };

    let subjectProgressList = subjects.map<CTypes.Subject, PTypes.SubjectProgress>(func(subj) {
      let mins = switch (state.subjectMinutes.get(subj.id)) {
        case (?m) m;
        case null 0;
      };
      let minutesMastery : Float = if (mins >= 60) 100.0
        else mins.toFloat() / 60.0 * 100.0;
      {
        subjectId = subj.id;
        masteryPercent = minutesMastery;
        totalStudyMinutes = mins;
        topicsStudied = if (mins > 0) 1 else 0;
        quizzesTaken = state.quizzesTaken;
        flashcardsReviewed = state.flashcardsReviewed;
      }
    });

    {
      subjectProgress = subjectProgressList.toArray();
      totalStudyMinutes = state.totalStudyMinutes;
      streakDays = state.streakDays;
      lastStudyDate = state.lastStudyDate;
    }
  };

  public func recordStudySession(
    progressMap : Map.Map<Principal, PTypes.UserProgressState>,
    caller : Principal,
    subjectId : CTypes.SubjectId,
    durationMinutes : Nat,
    now : Common.Timestamp,
  ) {
    let state = switch (progressMap.get(caller)) {
      case (?s) s;
      case null {
        let fresh = defaultProgress();
        progressMap.add(caller, fresh);
        fresh
      };
    };

    state.totalStudyMinutes += durationMinutes;

    let prevMins = switch (state.subjectMinutes.get(subjectId)) {
      case (?m) m;
      case null 0;
    };
    state.subjectMinutes.add(subjectId, prevMins + durationMinutes);

    // Update streak: compare day-level timestamps
    let today = now / nanosPerDay;
    switch (state.lastStudyDate) {
      case null {
        state.streakDays := 1;
      };
      case (?last) {
        let lastDay = last / nanosPerDay;
        if (today - lastDay == 1) {
          state.streakDays += 1;
        } else if (today - lastDay > 1) {
          state.streakDays := 1;
        };
        // Same day: no change to streak
      };
    };
    state.lastStudyDate := ?now;
  };
};

import Common "common";
import Curriculum "curriculum";

module {
  public type FlashcardId = Common.Id;
  public type FlashcardStatus = { #new_; #learning; #mastered };
  public type ReviewRating = { #easy; #good; #hard };

  public type Flashcard = {
    id : FlashcardId;
    topicId : Curriculum.TopicId;
    front : Text;
    back : Text;
  };

  // Per-user spaced repetition state for a flashcard
  public type FlashcardProgress = {
    flashcardId : FlashcardId;
    status : FlashcardStatus;
    easeFactor : Float;   // SM-2 ease factor (starts at 2.5)
    intervalDays : Nat;   // days until next review
    dueDate : Common.Timestamp; // nanoseconds
    reviewCount : Nat;
  };
};

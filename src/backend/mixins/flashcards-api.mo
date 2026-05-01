import List "mo:core/List";
import Map "mo:core/Map";
import FTypes "../types/flashcards";
import CTypes "../types/curriculum";
import FLib "../lib/flashcards";
import Time "mo:core/Time";

mixin (
  flashcards : List.List<FTypes.Flashcard>,
  flashcardProgress : Map.Map<Principal, List.List<FTypes.FlashcardProgress>>,
) {
  public query func getFlashcards(topicId : CTypes.TopicId) : async [FTypes.Flashcard] {
    FLib.getFlashcards(flashcards, topicId)
  };

  public query ({ caller }) func getDueFlashcards() : async [FTypes.Flashcard] {
    FLib.getDueFlashcards(flashcards, flashcardProgress, caller, Time.now())
  };

  public shared ({ caller }) func reviewFlashcard(cardId : FTypes.FlashcardId, rating : FTypes.ReviewRating) : async () {
    FLib.reviewFlashcard(flashcards, flashcardProgress, caller, cardId, rating, Time.now())
  };
};

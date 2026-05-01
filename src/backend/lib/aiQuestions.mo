import List "mo:core/List";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import QTypes "../types/questions";
import CTypes "../types/curriculum";

module {
  let dq = '\u{22}'; // double-quote character
  let bs = '\\';    // backslash character

  // Builds the AI prompt for question generation for a topic
  public func buildPrompt(
    topic : CTypes.Topic,
    count : Nat,
  ) : Text {
    "Generate exactly " # count.toText() # " multiple-choice questions (MCQs) for MBBS 1st year students on the topic: " # topic.title # ". " #
    "Topic description: " # topic.description # ". " #
    "Format the response as a JSON array of objects. Each object must have these exact fields: " #
    "text (question text), options (array of exactly 4 strings), correctIndex (0-3, index of correct option), explanation (detailed explanation). " #
    "Return only the JSON array in this format: [{\"text\":\"...\",\"options\":[\"A\",\"B\",\"C\",\"D\"],\"correctIndex\":0,\"explanation\":\"...\"}]. " #
    "Make questions clinically relevant, factually accurate, and suitable for MBBS 1st year."
  };

  // Parses raw JSON text from AI response into Question records
  public func parseAiResponse(
    raw : Text,
    topicId : CTypes.TopicId,
    startId : Nat,
  ) : [QTypes.Question] {
    let questionsOut = List.empty<QTypes.Question>();
    var idCounter = startId;

    // Split by "text": to find question blocks
    let marker = Text.fromChar(dq) # "text" # Text.fromChar(dq) # ":";
    let parts = raw.split(#text marker).toArray();

    var i = 1; // skip first part before first question
    while (i < parts.size()) {
      let part = parts[i];
      let qText = extractQuotedString(part);
      let opts = extractOptions(part);
      let ci = extractNatAfterLabel(part, Text.fromChar(dq) # "correctIndex" # Text.fromChar(dq) # ":");
      let expl = extractAfterLabel(part, Text.fromChar(dq) # "explanation" # Text.fromChar(dq) # ":");

      if (qText.size() > 0 and opts.size() == 4) {
        questionsOut.add({
          id = idCounter;
          topicId;
          text = qText;
          options = opts;
          correctIndex = ci;
          explanation = expl;
          isFlagged = false;
          source = #aiGenerated;
        });
        idCounter += 1;
      };
      i += 1;
    };

    questionsOut.toArray()
  };

  // Extract the first double-quoted string from a text
  func extractQuotedString(s : Text) : Text {
    let chars = s.toArray();
    var i = 0;
    let result = List.empty<Char>();
    var inString = false;
    var done = false;

    while (i < chars.size() and not done) {
      let c = chars[i];
      if (not inString) {
        if (c == dq) { inString := true };
      } else {
        if (c == bs) {
          i += 1;
          if (i < chars.size()) { result.add(chars[i]) };
        } else if (c == dq) {
          done := true;
        } else {
          result.add(c);
        };
      };
      i += 1;
    };
    Text.fromIter(result.values())
  };

  // Extract 4 options from the "options": [...] portion
  func extractOptions(s : Text) : [Text] {
    let optMarker = Text.fromChar(dq) # "options" # Text.fromChar(dq) # ":";
    let splitParts = s.split(#text optMarker).toArray();
    if (splitParts.size() < 2) return [];
    let optPart = splitParts[1];
    let chars = optPart.toArray();
    var i = 0;
    // find opening [
    while (i < chars.size() and chars[i] != '[') { i += 1 };
    i += 1;
    let opts = List.empty<Text>();
    while (i < chars.size() and opts.size() < 4) {
      let c = chars[i];
      if (c == dq) {
        i += 1;
        let opt = List.empty<Char>();
        var done = false;
        while (i < chars.size() and not done) {
          let ch = chars[i];
          if (ch == bs) {
            i += 1;
            if (i < chars.size()) { opt.add(chars[i]) };
          } else if (ch == dq) {
            done := true;
          } else {
            opt.add(ch);
          };
          i += 1;
        };
        opts.add(Text.fromIter(opt.values()));
      } else if (c == ']') {
        i := chars.size(); // exit while
      } else {
        i += 1;
      };
    };
    if (opts.size() == 4) opts.toArray() else []
  };

  // Extract a Nat value after a given label string
  func extractNatAfterLabel(s : Text, lbl : Text) : Nat {
    let splitParts = s.split(#text lbl).toArray();
    if (splitParts.size() < 2) return 0;
    let after = splitParts[1];
    let chars = after.toArray();
    var i = 0;
    while (i < chars.size() and (chars[i] == ' ' or chars[i] == '\n' or chars[i] == '\r' or chars[i] == '\t')) {
      i += 1;
    };
    let digits = List.empty<Char>();
    while (i < chars.size() and chars[i] >= '0' and chars[i] <= '9') {
      digits.add(chars[i]);
      i += 1;
    };
    switch (Nat.fromText(Text.fromIter(digits.values()))) {
      case (?n) n;
      case null 0;
    }
  };

  // Extract the quoted string after a given label
  func extractAfterLabel(s : Text, lbl : Text) : Text {
    let splitParts = s.split(#text lbl).toArray();
    if (splitParts.size() < 2) return "";
    extractQuotedString(splitParts[1])
  };
};

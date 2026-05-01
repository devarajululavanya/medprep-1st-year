import List "mo:core/List";
import Text "mo:core/Text";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import QTypes "../types/questions";
import CTypes "../types/curriculum";
import QLib "../lib/questions";
import CLib "../lib/curriculum";
import AILib "../lib/aiQuestions";

mixin (
  questions : List.List<QTypes.Question>,
  topics : List.List<CTypes.Topic>,
) {
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input)
  };

  public query func getQuestions(topicId : CTypes.TopicId) : async [QTypes.Question] {
    QLib.getQuestions(questions, topicId)
  };

  public query func getQuestion(id : QTypes.QuestionId) : async ?QTypes.Question {
    QLib.getQuestion(questions, id)
  };

  public shared func markQuestionFlagged(questionId : QTypes.QuestionId) : async () {
    QLib.markFlagged(questions, questionId)
  };

  public shared func generateQuestionsForTopic(topicId : CTypes.TopicId) : async [QTypes.Question] {
    let topic = switch (CLib.getTopic(topics, topicId)) {
      case (?t) t;
      case null return [];
    };
    let prompt = AILib.buildPrompt(topic, 5);
    let url = "https://api.openai.com/v1/chat/completions";
    let escapedPrompt = escapeJson(prompt);
    let body = "{\"model\":\"gpt-4o-mini\",\"messages\":[{\"role\":\"user\",\"content\":" # escapedPrompt # "}],\"temperature\":0.7}";
    let headers : [OutCall.Header] = [
      { name = "Content-Type"; value = "application/json" },
    ];
    let raw = await OutCall.httpPostRequest(url, headers, body, transform);
    let content = extractOpenAiContent(raw);
    let startId = QLib.nextId(questions);
    let generated = AILib.parseAiResponse(content, topicId, startId);
    for (q in generated.values()) {
      QLib.addQuestion(questions, q);
    };
    generated
  };

  // Escape a string for safe embedding as a JSON string value (wraps in quotes)
  func escapeJson(s : Text) : Text {
    let dq = '\u{22}'; // double-quote character
    let bs = '\\';    // backslash character
    var result = Text.fromChar(dq);
    for (c in s.toIter()) {
      if (c == dq) {
        result := result # Text.fromChar(bs) # Text.fromChar(dq);
      } else if (c == bs) {
        result := result # Text.fromChar(bs) # Text.fromChar(bs);
      } else if (c == '\n') {
        result := result # Text.fromChar(bs) # "n";
      } else if (c == '\r') {
        result := result # Text.fromChar(bs) # "r";
      } else {
        result := result # Text.fromChar(c);
      };
    };
    result # Text.fromChar(dq)
  };

  // Extract the "content" field value from an OpenAI JSON response
  func extractOpenAiContent(raw : Text) : Text {
    let dq = '\u{22}';
    let bs = '\\';
    let marker = "content" # Text.fromChar(dq) # ":";
    let splitParts = raw.split(#text marker).toArray();
    if (splitParts.size() < 2) return raw;
    let part = splitParts[1];
    let chars = part.toArray();
    var i = 0;
    // skip whitespace to opening quote
    while (i < chars.size() and chars[i] != dq) { i += 1 };
    if (i >= chars.size()) return raw;
    i += 1; // skip opening quote
    let result = List.empty<Char>();
    var done = false;
    while (i < chars.size() and not done) {
      let c = chars[i];
      if (c == bs) {
        i += 1;
        if (i < chars.size()) {
          let esc = chars[i];
          if (esc == 'n') { result.add('\n') }
          else if (esc == 't') { result.add('\t') }
          else if (esc == dq) { result.add(dq) }
          else if (esc == bs) { result.add(bs) }
          else { result.add(bs); result.add(esc) };
        };
      } else if (c == dq) {
        done := true;
      } else {
        result.add(c);
      };
      i += 1;
    };
    Text.fromIter(result.values())
  };
};

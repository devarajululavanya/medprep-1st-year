import List "mo:core/List";
import Types "../types/curriculum";
import Common "../types/common";

module {
  public func getSubjects(
    subjects : List.List<Types.Subject>
  ) : [Types.Subject] {
    subjects.toArray()
  };

  public func getTopics(
    topics : List.List<Types.Topic>,
    subjectId : Types.SubjectId,
  ) : [Types.Topic] {
    topics.filter(func(t) { t.subjectId == subjectId }).toArray()
  };

  public func getTopic(
    topics : List.List<Types.Topic>,
    id : Types.TopicId,
  ) : ?Types.Topic {
    topics.find(func(t) { t.id == id })
  };

  public func seedSubjects(subjects : List.List<Types.Subject>) {
    subjects.add({ id = 1; name = #anatomy; description = "Study of the structure of the human body, including gross anatomy, histology, and embryology."; topicCount = 5 });
    subjects.add({ id = 2; name = #physiology; description = "Study of the normal functions of the human body and its organ systems."; topicCount = 5 });
    subjects.add({ id = 3; name = #biochemistry; description = "Study of chemical processes within and related to living organisms."; topicCount = 5 });
  };

  public func seedTopics(topics : List.List<Types.Topic>) {
    // Anatomy topics (subjectId = 1)
    topics.add({ id = 1; subjectId = 1; title = "Bones and Joints"; description = "Skeletal system: bone types, joint classifications, and articulations."; orderIndex = 1 });
    topics.add({ id = 2; subjectId = 1; title = "Muscles and Tendons"; description = "Muscular system: muscle types, attachments, actions, and nerve supply."; orderIndex = 2 });
    topics.add({ id = 3; subjectId = 1; title = "Cardiovascular Anatomy"; description = "Heart chambers, valves, great vessels, and coronary circulation."; orderIndex = 3 });
    topics.add({ id = 4; subjectId = 1; title = "Nervous System Anatomy"; description = "Central and peripheral nervous system: brain, spinal cord, and cranial nerves."; orderIndex = 4 });
    topics.add({ id = 5; subjectId = 1; title = "Abdominal Organs"; description = "Anatomy of abdominal viscera: liver, spleen, kidney, gut, and peritoneum."; orderIndex = 5 });

    // Physiology topics (subjectId = 2)
    topics.add({ id = 6; subjectId = 2; title = "Cardiac Physiology"; description = "Cardiac cycle, ECG, cardiac output, and regulation of heart function."; orderIndex = 1 });
    topics.add({ id = 7; subjectId = 2; title = "Respiratory Physiology"; description = "Ventilation, gas exchange, lung volumes, and control of breathing."; orderIndex = 2 });
    topics.add({ id = 8; subjectId = 2; title = "Renal Physiology"; description = "Glomerular filtration, tubular reabsorption, and acid-base regulation."; orderIndex = 3 });
    topics.add({ id = 9; subjectId = 2; title = "Nerve and Muscle Physiology"; description = "Action potentials, neuromuscular junction, and muscle contraction."; orderIndex = 4 });
    topics.add({ id = 10; subjectId = 2; title = "Endocrine Physiology"; description = "Hormones, feedback loops, and regulation of metabolism and homeostasis."; orderIndex = 5 });

    // Biochemistry topics (subjectId = 3)
    topics.add({ id = 11; subjectId = 3; title = "Carbohydrate Metabolism"; description = "Glycolysis, TCA cycle, gluconeogenesis, and glycogen metabolism."; orderIndex = 1 });
    topics.add({ id = 12; subjectId = 3; title = "Protein Metabolism"; description = "Amino acid catabolism, urea cycle, and protein synthesis."; orderIndex = 2 });
    topics.add({ id = 13; subjectId = 3; title = "Lipid Metabolism"; description = "Beta-oxidation, lipogenesis, ketogenesis, and cholesterol biosynthesis."; orderIndex = 3 });
    topics.add({ id = 14; subjectId = 3; title = "Enzymes and Coenzymes"; description = "Enzyme kinetics, inhibition, cofactors, and vitamins as coenzymes."; orderIndex = 4 });
    topics.add({ id = 15; subjectId = 3; title = "Nucleotide Metabolism"; description = "Purine and pyrimidine synthesis, DNA replication, and repair."; orderIndex = 5 });
  };
};

import { createActor } from "@/backend";
import type {
  Difficulty,
  EceCase,
  Flashcard,
  FlashcardRating,
  Question,
  QuizResult,
  Subject,
  Topic,
  UserProgress,
} from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─── Seed / mock helpers (used when backend returns empty) ────────────────────

function seedSubjects(): Subject[] {
  return [
    {
      id: 1n,
      name: "anatomy",
      description:
        "Structure of the human body — gross, regional, and neuroanatomy.",
      topicCount: 12n,
    },
    {
      id: 2n,
      name: "physiology",
      description: "Functional mechanisms of every organ system in the body.",
      topicCount: 10n,
    },
    {
      id: 3n,
      name: "biochemistry",
      description:
        "Molecular foundations — metabolism, enzymes, genetics, and nutrition.",
      topicCount: 9n,
    },
  ];
}

function seedTopics(subjectId: bigint): Topic[] {
  const anatomy: Topic[] = [
    {
      id: 1n,
      subjectId: 1n,
      title: "Osteology",
      description: "Bones and skeletal system.",
      orderIndex: 1n,
    },
    {
      id: 2n,
      subjectId: 1n,
      title: "Arthrology",
      description: "Joints and their classification.",
      orderIndex: 2n,
    },
    {
      id: 3n,
      subjectId: 1n,
      title: "Myology",
      description: "Muscles, attachments, and actions.",
      orderIndex: 3n,
    },
    {
      id: 4n,
      subjectId: 1n,
      title: "Head & Neck",
      description: "Cranial nerves, cervical anatomy.",
      orderIndex: 4n,
    },
    {
      id: 5n,
      subjectId: 1n,
      title: "Thorax",
      description: "Heart, lungs, mediastinum.",
      orderIndex: 5n,
    },
    {
      id: 6n,
      subjectId: 1n,
      title: "Abdomen",
      description: "Abdominal organs and peritoneum.",
      orderIndex: 6n,
    },
    {
      id: 7n,
      subjectId: 1n,
      title: "Pelvis & Perineum",
      description: "Pelvic floor and reproductive anatomy.",
      orderIndex: 7n,
    },
    {
      id: 8n,
      subjectId: 1n,
      title: "Upper Limb",
      description: "Shoulder, arm, forearm, hand.",
      orderIndex: 8n,
    },
    {
      id: 9n,
      subjectId: 1n,
      title: "Lower Limb",
      description: "Hip, thigh, leg, foot.",
      orderIndex: 9n,
    },
    {
      id: 10n,
      subjectId: 1n,
      title: "Neuroanatomy",
      description: "Brain, spinal cord, peripheral nerves.",
      orderIndex: 10n,
    },
    {
      id: 11n,
      subjectId: 1n,
      title: "Histology",
      description: "Microscopic structure of tissues.",
      orderIndex: 11n,
    },
    {
      id: 12n,
      subjectId: 1n,
      title: "Embryology",
      description: "Development from fertilization to birth.",
      orderIndex: 12n,
    },
  ];
  const physiology: Topic[] = [
    {
      id: 13n,
      subjectId: 2n,
      title: "Cell Physiology",
      description: "Membrane transport and cell signaling.",
      orderIndex: 1n,
    },
    {
      id: 14n,
      subjectId: 2n,
      title: "Blood & Haemopoiesis",
      description: "Blood composition, clotting, immunity.",
      orderIndex: 2n,
    },
    {
      id: 15n,
      subjectId: 2n,
      title: "Cardiovascular",
      description: "Cardiac cycle, blood pressure, circulation.",
      orderIndex: 3n,
    },
    {
      id: 16n,
      subjectId: 2n,
      title: "Respiratory",
      description: "Mechanics of breathing, gas exchange.",
      orderIndex: 4n,
    },
    {
      id: 17n,
      subjectId: 2n,
      title: "Renal",
      description: "Glomerular filtration, tubular function.",
      orderIndex: 5n,
    },
    {
      id: 18n,
      subjectId: 2n,
      title: "Gastrointestinal",
      description: "Digestion, absorption, gut hormones.",
      orderIndex: 6n,
    },
    {
      id: 19n,
      subjectId: 2n,
      title: "Endocrine",
      description: "Hormone synthesis, feedback loops.",
      orderIndex: 7n,
    },
    {
      id: 20n,
      subjectId: 2n,
      title: "Nervous System",
      description: "Action potentials, synaptic transmission.",
      orderIndex: 8n,
    },
    {
      id: 21n,
      subjectId: 2n,
      title: "Muscle Physiology",
      description: "Contraction mechanism, motor unit.",
      orderIndex: 9n,
    },
    {
      id: 22n,
      subjectId: 2n,
      title: "Reproductive",
      description: "Menstrual cycle, pregnancy physiology.",
      orderIndex: 10n,
    },
  ];
  const biochemistry: Topic[] = [
    {
      id: 23n,
      subjectId: 3n,
      title: "Amino Acids & Proteins",
      description: "Structure, classification, and functions.",
      orderIndex: 1n,
    },
    {
      id: 24n,
      subjectId: 3n,
      title: "Enzymes",
      description: "Kinetics, inhibition, coenzymes.",
      orderIndex: 2n,
    },
    {
      id: 25n,
      subjectId: 3n,
      title: "Carbohydrate Metabolism",
      description: "Glycolysis, TCA cycle, gluconeogenesis.",
      orderIndex: 3n,
    },
    {
      id: 26n,
      subjectId: 3n,
      title: "Lipid Metabolism",
      description: "Fatty acid oxidation, ketone bodies.",
      orderIndex: 4n,
    },
    {
      id: 27n,
      subjectId: 3n,
      title: "Nucleotide Metabolism",
      description: "Purines, pyrimidines, salvage pathways.",
      orderIndex: 5n,
    },
    {
      id: 28n,
      subjectId: 3n,
      title: "DNA & RNA",
      description: "Replication, transcription, translation.",
      orderIndex: 6n,
    },
    {
      id: 29n,
      subjectId: 3n,
      title: "Vitamins & Minerals",
      description: "Cofactors, deficiency diseases.",
      orderIndex: 7n,
    },
    {
      id: 30n,
      subjectId: 3n,
      title: "Hormonal Biochemistry",
      description: "Second messengers, receptor types.",
      orderIndex: 8n,
    },
    {
      id: 31n,
      subjectId: 3n,
      title: "Nutrition & Dietetics",
      description: "Caloric requirements, malnutrition.",
      orderIndex: 9n,
    },
  ];
  if (subjectId === 1n) return anatomy;
  if (subjectId === 2n) return physiology;
  return biochemistry;
}

function seedQuestions(topicId: bigint): Question[] {
  return [
    {
      id: topicId * 100n + 1n,
      topicId,
      text: "Which muscle is the prime mover of shoulder abduction?",
      options: ["Pectoralis major", "Deltoid", "Trapezius", "Supraspinatus"],
      correctIndex: 1n,
      explanation:
        "The deltoid muscle is the prime mover of shoulder abduction from 15–90°. Supraspinatus initiates the first 15°.",
      isFlagged: false,
    },
    {
      id: topicId * 100n + 2n,
      topicId,
      text: "Which nerve is responsible for the 'claw hand' deformity?",
      options: [
        "Median nerve",
        "Radial nerve",
        "Ulnar nerve",
        "Axillary nerve",
      ],
      correctIndex: 2n,
      explanation:
        "Ulnar nerve palsy causes claw hand (main en griffe) due to paralysis of the intrinsic muscles of the hand, particularly the lumbricals and interossei.",
      isFlagged: false,
    },
    {
      id: topicId * 100n + 3n,
      topicId,
      text: "What is the normal resting membrane potential of a neuron?",
      options: ["-55 mV", "-70 mV", "+40 mV", "-90 mV"],
      correctIndex: 1n,
      explanation:
        "The resting membrane potential of a typical neuron is approximately -70 mV, maintained by the Na⁺/K⁺-ATPase pump and selective ion permeability.",
      isFlagged: false,
    },
    {
      id: topicId * 100n + 4n,
      topicId,
      text: "Which enzyme catalyzes the rate-limiting step of glycolysis?",
      options: [
        "Hexokinase",
        "Aldolase",
        "Phosphofructokinase-1",
        "Pyruvate kinase",
      ],
      correctIndex: 2n,
      explanation:
        "Phosphofructokinase-1 (PFK-1) catalyzes the irreversible phosphorylation of fructose-6-phosphate to fructose-1,6-bisphosphate and is the key regulatory enzyme of glycolysis.",
      isFlagged: false,
    },
    {
      id: topicId * 100n + 5n,
      topicId,
      text: "The Frank-Starling law of the heart states that:",
      options: [
        "Heart rate increases with sympathetic stimulation",
        "Stroke volume increases with increased end-diastolic volume",
        "Cardiac output is constant regardless of filling",
        "Contractility decreases with increased preload",
      ],
      correctIndex: 1n,
      explanation:
        "The Frank-Starling law states that stroke volume increases as end-diastolic volume increases, up to a physiological limit, due to optimal sarcomere length and cross-bridge formation.",
      isFlagged: false,
    },
  ];
}

function seedFlashcards(topicId: bigint): Flashcard[] {
  return [
    {
      id: topicId * 200n + 1n,
      topicId,
      front: "What is the nerve supply of the diaphragm?",
      back: "Phrenic nerve (C3, C4, C5) — 'C3, 4, 5 keeps the diaphragm alive'",
    },
    {
      id: topicId * 200n + 2n,
      topicId,
      front: "Name the rotator cuff muscles",
      back: "SITS: Supraspinatus, Infraspinatus, Teres minor, Subscapularis",
    },
    {
      id: topicId * 200n + 3n,
      topicId,
      front: "What is the normal FEV1/FVC ratio?",
      back: "> 0.7 (70%). Reduced in obstructive disease, normal/increased in restrictive disease.",
    },
    {
      id: topicId * 200n + 4n,
      topicId,
      front: "Define Km in enzyme kinetics",
      back: "Michaelis constant — substrate concentration at which reaction velocity is half maximum (Vmax/2). Reflects enzyme-substrate affinity.",
    },
    {
      id: topicId * 200n + 5n,
      topicId,
      front: "What is the Henderson-Hasselbalch equation?",
      back: "pH = pKa + log([A⁻]/[HA]). Used to calculate blood pH from bicarbonate and CO₂.",
    },
    {
      id: topicId * 200n + 6n,
      topicId,
      front: "Where does β-oxidation of fatty acids occur?",
      back: "Mitochondrial matrix. Long-chain fatty acids require carnitine shuttle to enter mitochondria.",
    },
  ];
}

function seedCases(_subjectId?: bigint): EceCase[] {
  return [
    {
      id: 1n,
      title: "Chest Pain in a 55-Year-Old Male",
      presentation:
        "A 55-year-old male presents to the emergency department with crushing central chest pain radiating to the left arm for 90 minutes. He is diaphoretic and pale. ECG shows ST-elevation in leads II, III, and aVF.",
      questions: [
        {
          text: "What is the most likely diagnosis and which coronary artery is affected?",
          modelAnswer:
            "ST-elevation myocardial infarction (STEMI) involving the right coronary artery (RCA), which supplies the inferior wall and right ventricle.",
        },
        {
          text: "Explain the physiological basis of referred pain in this case.",
          modelAnswer:
            "Referred pain occurs due to convergence of visceral (cardiac) and somatic afferent fibres at the same spinal cord segment (T1–T5). The brain misinterprets the pain source as the left arm or jaw.",
        },
      ],
      learningPoints: [
        "RCA supplies SA node, AV node, and inferior wall of left ventricle",
        "Killip classification used for prognostication",
        "Time-to-reperfusion critical: 'door-to-balloon' < 90 minutes",
      ],
      difficulty: "medium",
    },
    {
      id: 2n,
      title: "Jaundice in a 22-Year-Old Female",
      presentation:
        "A 22-year-old medical student presents with yellow discolouration of skin and sclera, dark urine, and pale stools for 5 days. She returned from a trip to rural India 4 weeks ago. LFTs show elevated AST/ALT (10× normal) and raised bilirubin.",
      questions: [
        {
          text: "Classify the jaundice and identify the most likely cause.",
          modelAnswer:
            "Hepatocellular jaundice most likely due to Hepatitis A virus (HAV) infection, given the travel history, incubation period, and markedly elevated transaminases.",
        },
        {
          text: "Explain the biochemical basis of dark urine and pale stools.",
          modelAnswer:
            "Dark urine results from conjugated bilirubin (water-soluble) spilling into urine. Pale stools occur because bile flow to the intestine is impaired, reducing urobilinogen and stercobilin production.",
        },
      ],
      learningPoints: [
        "Conjugated vs. unconjugated bilirubin: clinical significance",
        "Urine urobilinogen differentiates hepatocellular from obstructive jaundice",
        "HAV is feco-oral, self-limiting; Hepatitis B/C are parenteral",
      ],
      difficulty: "easy",
    },
    {
      id: 3n,
      title: "Breathlessness on Exertion — Anaemia Workup",
      presentation:
        "A 30-year-old pregnant woman (28 weeks) presents with fatigue, pallor, and palpitations on mild exertion. Hb = 7.2 g/dL, MCV = 65 fL, serum ferritin = 6 µg/L.",
      questions: [
        {
          text: "Diagnose and explain the pathophysiology of this anaemia.",
          modelAnswer:
            "Microcytic hypochromic anaemia due to iron deficiency. Decreased ferritin depletes iron stores, impairing haem synthesis and reducing haemoglobin production, leading to smaller (microcytic) and paler (hypochromic) RBCs.",
        },
        {
          text: "How does pregnancy increase iron requirements?",
          modelAnswer:
            "Expanded maternal plasma volume, increased RBC mass, foetal iron transfer (especially third trimester), and anticipated delivery blood loss increase iron demand from ~18 mg/day to ~27 mg/day in pregnancy.",
        },
      ],
      learningPoints: [
        "Iron absorption regulated by hepcidin",
        "Transferrin and TIBC elevated in iron deficiency (inverse of ferritin)",
        "Folate supplementation prevents neural tube defects",
      ],
      difficulty: "easy",
    },
  ];
}

function seedProgress(): UserProgress {
  return {
    subjectProgress: [
      {
        subjectId: 1n,
        masteryPercent: 68,
        totalStudyMinutes: 420n,
        topicsStudied: 8n,
        quizzesTaken: 12n,
        flashcardsReviewed: 156n,
      },
      {
        subjectId: 2n,
        masteryPercent: 52,
        totalStudyMinutes: 310n,
        topicsStudied: 5n,
        quizzesTaken: 8n,
        flashcardsReviewed: 98n,
      },
      {
        subjectId: 3n,
        masteryPercent: 45,
        totalStudyMinutes: 240n,
        topicsStudied: 4n,
        quizzesTaken: 6n,
        flashcardsReviewed: 72n,
      },
    ],
    totalStudyMinutes: 970n,
    streakDays: 14n,
    lastStudyDate: BigInt(Date.now()),
  };
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useSubjects() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Subject[]>({
    queryKey: ["subjects"],
    queryFn: async () => {
      if (!actor) return seedSubjects();
      try {
        const result = await (
          actor as unknown as { getSubjects: () => Promise<Subject[]> }
        ).getSubjects();
        return result?.length ? result : seedSubjects();
      } catch {
        return seedSubjects();
      }
    },
    enabled: !isFetching,
    placeholderData: seedSubjects(),
  });
}

export function useTopics(subjectId: bigint) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Topic[]>({
    queryKey: ["topics", subjectId.toString()],
    queryFn: async () => {
      if (!actor) return seedTopics(subjectId);
      try {
        const result = await (
          actor as unknown as { getTopics: (id: bigint) => Promise<Topic[]> }
        ).getTopics(subjectId);
        return result?.length ? result : seedTopics(subjectId);
      } catch {
        return seedTopics(subjectId);
      }
    },
    enabled: !isFetching,
    placeholderData: () => seedTopics(subjectId),
  });
}

export function useTopic(topicId: bigint) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Topic | null>({
    queryKey: ["topic", topicId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await (
          actor as unknown as { getTopic: (id: bigint) => Promise<Topic> }
        ).getTopic(topicId);
      } catch {
        return null;
      }
    },
    enabled: !isFetching,
  });
}

export function useQuestions(topicId: bigint) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Question[]>({
    queryKey: ["questions", topicId.toString()],
    queryFn: async () => {
      if (!actor) return seedQuestions(topicId);
      try {
        const result = await (
          actor as unknown as {
            getQuestions: (id: bigint) => Promise<Question[]>;
          }
        ).getQuestions(topicId);
        return result?.length ? result : seedQuestions(topicId);
      } catch {
        return seedQuestions(topicId);
      }
    },
    enabled: !isFetching,
    placeholderData: () => seedQuestions(topicId),
  });
}

export function useFlashcards(topicId: bigint) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Flashcard[]>({
    queryKey: ["flashcards", topicId.toString()],
    queryFn: async () => {
      if (!actor) return seedFlashcards(topicId);
      try {
        const result = await (
          actor as unknown as {
            getFlashcards: (id: bigint) => Promise<Flashcard[]>;
          }
        ).getFlashcards(topicId);
        return result?.length ? result : seedFlashcards(topicId);
      } catch {
        return seedFlashcards(topicId);
      }
    },
    enabled: !isFetching,
    placeholderData: () => seedFlashcards(topicId),
  });
}

export function useDueFlashcards() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Flashcard[]>({
    queryKey: ["flashcards", "due"],
    queryFn: async () => {
      if (!actor) return seedFlashcards(1n).slice(0, 3);
      try {
        return await (
          actor as unknown as { getDueFlashcards: () => Promise<Flashcard[]> }
        ).getDueFlashcards();
      } catch (_e) {
        return seedFlashcards(1n).slice(0, 3);
      }
    },
    enabled: !isFetching,
  });
}

export function useReviewFlashcard() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      cardId,
      rating,
    }: { cardId: bigint; rating: FlashcardRating }) => {
      if (!actor) return;
      await (
        actor as unknown as {
          reviewFlashcard: (id: bigint, r: FlashcardRating) => Promise<void>;
        }
      ).reviewFlashcard(cardId, rating);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["flashcards"] });
    },
  });
}

export function useCases(subjectId?: bigint) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<EceCase[]>({
    queryKey: ["cases", subjectId?.toString() ?? "all"],
    queryFn: async () => {
      if (!actor) return seedCases(subjectId);
      try {
        const result = await (
          actor as unknown as { getCases: (id?: bigint) => Promise<EceCase[]> }
        ).getCases(subjectId);
        return result?.length ? result : seedCases(subjectId);
      } catch {
        return seedCases(subjectId);
      }
    },
    enabled: !isFetching,
    placeholderData: () => seedCases(subjectId),
  });
}

export function useCase(caseId: bigint) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<EceCase | null>({
    queryKey: ["case", caseId.toString()],
    queryFn: async () => {
      if (!actor) return seedCases()[Number(caseId) - 1] ?? null;
      try {
        return await (
          actor as unknown as { getCase: (id: bigint) => Promise<EceCase> }
        ).getCase(caseId);
      } catch {
        return seedCases()[Number(caseId) - 1] ?? null;
      }
    },
    enabled: !isFetching,
  });
}

export function useUserProgress() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<UserProgress>({
    queryKey: ["progress"],
    queryFn: async () => {
      if (!actor) return seedProgress();
      try {
        return await (
          actor as unknown as { getUserProgress: () => Promise<UserProgress> }
        ).getUserProgress();
      } catch {
        return seedProgress();
      }
    },
    enabled: !isFetching,
    placeholderData: seedProgress(),
  });
}

function seedQuizHistory(): QuizResult[] {
  const now = BigInt(Date.now());
  const day = 86_400_000n;
  return [
    {
      quizId: 1001n,
      score: 4n,
      totalQuestions: 5n,
      percentage: 80,
      correctAnswers: [true, true, false, true, true],
      completedAt: now - day * 2n,
    },
    {
      quizId: 1002n,
      score: 3n,
      totalQuestions: 5n,
      percentage: 60,
      correctAnswers: [true, false, true, false, true],
      completedAt: now - day * 5n,
    },
    {
      quizId: 1003n,
      score: 5n,
      totalQuestions: 5n,
      percentage: 100,
      correctAnswers: [true, true, true, true, true],
      completedAt: now - day * 9n,
    },
  ];
}

export function useQuizHistory() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<QuizResult[]>({
    queryKey: ["quiz", "history"],
    queryFn: async () => {
      if (!actor) return seedQuizHistory();
      try {
        const result = await (
          actor as unknown as { getQuizHistory: () => Promise<QuizResult[]> }
        ).getQuizHistory();
        return result?.length ? result : seedQuizHistory();
      } catch {
        return seedQuizHistory();
      }
    },
    enabled: !isFetching,
    placeholderData: seedQuizHistory(),
  });
}

export function useCreateQuiz() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      topicId,
      questionCount,
    }: { topicId: bigint; questionCount: number }) => {
      if (!actor) return 0n;
      return await (
        actor as unknown as {
          createQuiz: (t: bigint, q: number) => Promise<bigint>;
        }
      ).createQuiz(topicId, questionCount);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quiz"] }),
  });
}

export function useSubmitQuiz() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      quizId,
      answers,
    }: { quizId: bigint; answers: number[] }) => {
      if (!actor) {
        const result: QuizResult = {
          quizId,
          score: BigInt(answers.filter((_, i) => i % 2 === 0).length),
          totalQuestions: BigInt(answers.length),
          percentage: Math.round(
            (answers.filter((_, i) => i % 2 === 0).length / answers.length) *
              100,
          ),
          correctAnswers: answers.map((_, i) => i % 2 === 0),
          completedAt: BigInt(Date.now()),
        };
        return result;
      }
      return await (
        actor as unknown as {
          submitQuiz: (id: bigint, a: number[]) => Promise<QuizResult>;
        }
      ).submitQuiz(quizId, answers);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quiz"] }),
  });
}

export function useMarkQuestionFlagged() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (questionId: bigint) => {
      if (!actor) return;
      await (
        actor as unknown as {
          markQuestionFlagged: (id: bigint) => Promise<void>;
        }
      ).markQuestionFlagged(questionId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["questions"] }),
  });
}

export function useRecordStudySession() {
  const qc = useQueryClient();
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      subjectId,
      durationMinutes,
    }: { subjectId: bigint; durationMinutes: number }) => {
      if (!actor) return;
      await (
        actor as unknown as {
          recordStudySession: (s: bigint, d: number) => Promise<void>;
        }
      ).recordStudySession(subjectId, durationMinutes);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["progress"] }),
  });
}

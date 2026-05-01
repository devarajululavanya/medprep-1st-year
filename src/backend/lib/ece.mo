import List "mo:core/List";
import Map "mo:core/Map";
import ETypes "../types/ece";
import CTypes "../types/curriculum";
import Common "../types/common";

module {
  public func getCases(
    cases : List.List<ETypes.EceCase>,
    subjectId : ?CTypes.SubjectId,
  ) : [ETypes.EceCase] {
    switch (subjectId) {
      case null cases.toArray();
      case (?sid) cases.filter(func(c) {
        c.subjectTags.find(func(tag) { tag == sid }) != null
      }).toArray();
    }
  };

  public func getCase(
    cases : List.List<ETypes.EceCase>,
    id : ETypes.CaseId,
  ) : ?ETypes.EceCase {
    cases.find(func(c) { c.id == id })
  };

  public func submitCaseAnswer(
    submissions : Map.Map<Principal, List.List<ETypes.CaseSubmission>>,
    caller : Principal,
    caseId : ETypes.CaseId,
    questionIndex : Nat,
    answer : Text,
    now : Common.Timestamp,
  ) {
    let userSubs = switch (submissions.get(caller)) {
      case (?s) s;
      case null {
        let fresh = List.empty<ETypes.CaseSubmission>();
        submissions.add(caller, fresh);
        fresh
      };
    };
    let submission : ETypes.CaseSubmission = {
      caseId;
      questionIndex;
      userAnswer = answer;
      submittedAt = now;
    };
    userSubs.add(submission);
  };

  public func seedCases(cases : List.List<ETypes.EceCase>) {
    // Anatomy cases
    cases.add({
      id = 1;
      title = "The Painful Shoulder";
      presentation = "A 45-year-old right-handed painter presents with a 3-month history of right shoulder pain, especially when lifting his arm above shoulder height (painful arc 60°-120°). He finds it difficult to sleep on the right side. Examination: tenderness over the greater tuberosity; Neer and Hawkins-Kennedy tests positive; strength testing shows weakness of abduction with arm in slight internal rotation (empty can test positive).";
      questions = [
        { text = "What anatomical structure is most likely injured in this patient and why?"; modelAnswer = "The supraspinatus tendon. It passes under the coracoacromial arch and is most vulnerable to impingement/rotator cuff tear. Empty can test (Jobe's test) specifically tests supraspinatus. The painful arc 60-120° is classic for supraspinatus impingement." },
        { text = "Name the four muscles of the rotator cuff and their primary actions."; modelAnswer = "Supraspinatus (abduction initiation, 0-15°), Infraspinatus (external rotation), Teres Minor (external rotation and adduction), Subscapularis (internal rotation, adduction). Together they stabilise the glenohumeral joint by compressing the humeral head into the glenoid fossa." },
        { text = "What nerve supplies the supraspinatus and infraspinatus? What would happen if this nerve were damaged?"; modelAnswer = "The suprascapular nerve (C5, C6) from the superior trunk of the brachial plexus. Damage would cause weakness of abduction and external rotation, wasting of supra- and infraspinatus fossae, and difficulty raising the arm." },
      ];
      learningPoints = [
        "The supraspinatus tendon is the most commonly torn component of the rotator cuff, often at the 'critical zone' of relative avascularity near its insertion.",
        "The coracoacromial arch (coracoid + coracoacromial ligament + acromion) forms the roof of the subacromial space; osteophytes or morphological variants narrow this space.",
        "Full thickness rotator cuff tears may be managed conservatively (physiotherapy) or surgically (arthroscopic repair) depending on size and functional impairment.",
        "Neer and Hawkins-Kennedy impingement tests have moderate sensitivity; MRI arthrography is the gold standard for diagnosing rotator cuff tears."
      ];
      subjectTags = [1];
      difficulty = #medium;
    });

    cases.add({
      id = 2;
      title = "Myocardial Infarction — Clinical Anatomy";
      presentation = "A 58-year-old hypertensive male presents to A&E with severe crushing chest pain radiating to his left arm and jaw for 2 hours, accompanied by sweating and nausea. ECG shows ST elevation in leads II, III, and aVF. Troponin I is markedly elevated. He is diagnosed with an inferior STEMI.";
      questions = [
        { text = "Which coronary artery is most likely occluded and what territory does it supply?"; modelAnswer = "The right coronary artery (RCA). It supplies the right atrium, right ventricle, inferior (diaphragmatic) surface of the left ventricle, posterior interventricular septum, SA node (55%), and AV node (90%). Inferior STEMI = ST elevation in II, III, aVF = RCA territory." },
        { text = "Why might this patient develop a bradyarrhythmia and what anatomical basis explains it?"; modelAnswer = "The RCA supplies the AV node (in ~90% of people) and SA node (in ~55%). Inferior MI → ischaemia of conduction system → AV block (1st, 2nd or 3rd degree) or sinus bradycardia. This is often transient due to enhanced vagal tone and ischaemia." },
        { text = "Describe the coronary circulation: origin, course, and anastomoses."; modelAnswer = "Right and left coronary arteries arise from the aortic sinuses (sinuses of Valsalva) just above the aortic valve. LCA → LAD (anterior septum, anterior LV) + circumflex (lateral LV, posterior LV in left-dominant). RCA → marginal branches, PDA. Anastomoses at the apex may provide collateral supply. Dominance (origin of PDA) is right in 85%, left in 8%, co-dominant in 7%." },
      ];
      learningPoints = [
        "Inferior STEMI (ST elevation II, III, aVF) most often results from RCA occlusion; important to check for right ventricular involvement (ST elevation in V4R).",
        "Coronary dominance determines which artery supplies the posterior descending artery (PDA) — right dominant in 85% of the population.",
        "The 'area at risk' corresponds to the myocardium supplied by the occluded artery distal to the blockage; early reperfusion (primary PCI) salvages at-risk myocardium.",
        "Complications of inferior MI include AV block, RV failure, mitral regurgitation (posterior papillary muscle ischaemia), and ventricular septal defect."
      ];
      subjectTags = [1, 2];
      difficulty = #hard;
    });

    // Physiology cases
    cases.add({
      id = 3;
      title = "Type 1 Respiratory Failure";
      presentation = "A 72-year-old ex-smoker with known COPD presents acutely breathless at rest. He has a barrel chest, pursed-lip breathing, and accessory muscle use. ABG on air: pH 7.38, PaO2 6.2 kPa (47 mmHg), PaCO2 4.8 kPa (36 mmHg), HCO3 25 mEq/L, SpO2 83%.";
      questions = [
        { text = "Classify the type of respiratory failure and explain the mechanism."; modelAnswer = "Type 1 (hypoxaemic) respiratory failure: PaO2 < 8 kPa with normal/low PaCO2. In COPD, V/Q mismatch (poorly ventilated but perfused alveoli = low V/Q units, intrapulmonary shunt-like effect) is the predominant mechanism. Air-trapping reduces effective alveolar ventilation to some areas." },
        { text = "Why is high-flow oxygen potentially dangerous in some COPD patients?"; modelAnswer = "Patients with chronic hypercapnia (type 2 failure) rely on hypoxic ventilatory drive (peripheral chemoreceptors at carotid/aortic bodies). High-flow O2 abolishes this hypoxic drive → hypoventilation → CO2 retention → respiratory acidosis. Also: Haldane effect (O2 displaces CO2 from Hb) increases dissolved CO2." },
        { text = "Using the alveolar gas equation, explain why V/Q mismatch causes hypoxaemia."; modelAnswer = "PAO2 = PIO2 - PaCO2/R (R≈0.8). Low V/Q units: CO2 not washed out → high alveolar CO2 → low PAO2. High V/Q dead-space units can't compensate: though they have high PAO2, Hb is already nearly saturated (plateau of dissociation curve), so little extra O2 is carried. Net result: arterial O2 is reduced." },
      ];
      learningPoints = [
        "Type 1 RF: PaO2 < 8 kPa, PaCO2 normal or low. Causes: V/Q mismatch (COPD, PE), diffusion impairment, shunt (pneumonia, pulmonary oedema).",
        "Type 2 RF: PaO2 < 8 kPa AND PaCO2 > 6 kPa. Causes: respiratory pump failure (COPD exacerbation, neuromuscular disease, chest wall deformity).",
        "Target SpO2 88-92% with controlled O2 therapy in COPD (avoid suppressing hypoxic drive); NIV (BiPAP) is cornerstone of managing acute hypercapnic exacerbations.",
        "ABG interpretation: assess pH → acidosis/alkalosis; PaCO2 → respiratory component; HCO3 → metabolic component; check compensation."
      ];
      subjectTags = [2];
      difficulty = #hard;
    });

    cases.add({
      id = 4;
      title = "Acute Kidney Injury";
      presentation = "A 24-year-old marathon runner collapses at the finish line. He consumed minimal fluids during the 42 km race in hot weather. Serum creatinine 380 µmol/L (baseline unknown), urea 18 mmol/L, urine output <0.3 mL/kg/hr for 6 hours. Urine is dark brown. Urine osmolality 900 mOsm/kg; urine sodium 8 mmol/L.";
      questions = [
        { text = "What is the most likely cause of AKI in this patient and why?"; modelAnswer = "Pre-renal AKI due to severe dehydration (volume depletion) + rhabdomyolysis. Evidence: concentrated urine (high osmolality 900 mOsm/kg), very low urinary Na (8 mEq/L — kidneys avidly retaining Na), dark urine (myoglobinuria). Muscle breakdown → myoglobin → tubular toxicity adds intrinsic component." },
        { text = "Explain the renal physiological response to hypovolaemia."; modelAnswer = "↓ECV → ↓renal perfusion pressure → afferent arteriole baroreceptors activate renin release (RAAS) → Ang II → efferent arteriolar vasoconstriction (maintains GFR) + aldosterone → ↑Na/water reabsorption. ADH released from posterior pituitary → ↑collecting duct aquaporin-2 → water reabsorption → concentrated urine. Renal autoregulation (myogenic + TGF) maintains GFR down to MAP ~70 mmHg." },
        { text = "How would you calculate and interpret the fractional excretion of sodium (FENa)?"; modelAnswer = "FENa = (UNa × PCr) / (PNa × UCr) × 100%. Pre-renal AKI: FENa < 1% (kidneys conserve Na). Intrinsic renal (tubular) injury: FENa > 2% (tubules cannot reabsorb Na). This patient: low urine Na (8 mEq/L) → FENa likely < 1% → supports pre-renal aetiology. Limitation: FENa unreliable with diuretics." },
      ];
      learningPoints = [
        "AKI classified by KDIGO criteria: rise in creatinine ≥26.5 µmol/L in 48h, or ≥1.5× baseline in 7 days, or UO <0.5 mL/kg/hr for ≥6h.",
        "Pre-renal (hypovolaemic/haemodynamic): urine Osm >500, urine Na <20, FENa <1%. Intrinsic (ATN): urine Osm ~300, urine Na >40, FENa >2%.",
        "Rhabdomyolysis: myoglobin (positively charged) binds Tamm-Horsfall protein → tubular casts; direct tubular toxicity; vasoconstriction. Treat with aggressive IV fluids and alkaline urine.",
        "RAAS activation is the primary mediator of pre-renal AKI — ACE inhibitors/ARBs can unmask or worsen it by dilating the efferent arteriole and reducing GFR."
      ];
      subjectTags = [2, 3];
      difficulty = #medium;
    });

    // Biochemistry cases
    cases.add({
      id = 5;
      title = "Diabetic Ketoacidosis (DKA)";
      presentation = "A 19-year-old woman with known type 1 diabetes presents confused with vomiting and Kussmaul breathing. She missed her insulin yesterday. Investigations: blood glucose 28 mmol/L, pH 7.12, bicarbonate 8 mEq/L, pCO2 2.8 kPa, ketones 6.3 mmol/L, Na 131 mEq/L, K 5.8 mEq/L (before treatment).";
      questions = [
        { text = "Explain the biochemical basis of ketoacidosis in the absence of insulin."; modelAnswer = "Without insulin: glucagon dominates. Hormone-sensitive lipase activated → lipolysis → fatty acids to liver → β-oxidation overloaded → excess acetyl-CoA (can't enter TCA — oxaloacetate diverted to gluconeogenesis) → ketogenesis (acetoacetate, β-hydroxybutyrate, acetone) → metabolic acidosis (high anion gap). Kussmaul breathing = respiratory compensation (blow off CO2)." },
        { text = "Why is serum K elevated initially in DKA and what happens with treatment?"; modelAnswer = "Despite total body K⁺ depletion, serum K is high because: acidosis → H⁺ moves into cells, K⁺ moves out; insulin deficiency → reduced Na/K ATPase activity; hyperosmolality → water and K shift out of cells. With insulin treatment: K⁺ rapidly shifts intracellularly → risk of hypokalaemia → can precipitate fatal arrhythmias. Must supplement K⁺ once K < 5.5 mEq/L and urine output confirmed." },
        { text = "Calculate and interpret the anion gap for this patient (Na=131, Cl=95, HCO3=8)."; modelAnswer = "Anion gap = Na - (Cl + HCO3) = 131 - (95 + 8) = 28 mEq/L (normal 8-12). Elevated AG = unmeasured anions (here, ketone bodies — acetoacetate and β-hydroxybutyrate are organic acids). MUDPILES mnemonic for high-AG metabolic acidosis: Methanol, Uraemia, DKA, Propylene glycol, Infection/INH, Lactic acidosis, Ethylene glycol, Salicylates." },
      ];
      learningPoints = [
        "DKA diagnostic criteria: glucose >11 mmol/L, pH <7.3 or HCO3 <15, ketones >3 mmol/L or ketonuria. Treat with IV fluids, insulin infusion, K⁺ replacement.",
        "The Krebs cycle requires oxaloacetate to accept acetyl-CoA; in starvation/DKA, OAA is diverted to gluconeogenesis → ketone bodies are the overflow product.",
        "Kussmaul breathing (deep, rapid breathing) is the respiratory compensation for metabolic acidosis — pCO2 falls by ~1.2 mmHg per 1 mEq/L fall in HCO3.",
        "Serum Na may be pseudohyponatraemia in hyperglycaemia: corrected Na = measured Na + 2.4 × (glucose - 5) / 5."
      ];
      subjectTags = [3];
      difficulty = #hard;
    });

    cases.add({
      id = 6;
      title = "Jaundice — Biochemical Classification";
      presentation = "A 35-year-old woman presents with yellow sclerae and skin for 1 week. She has no pain, pale stools, and dark urine. She has a history of primary biliary cirrhosis. LFTs: Bilirubin (total) 85 µmol/L, conjugated 70 µmol/L, ALT 45 U/L, ALP 420 U/L, GGT 380 U/L, albumin 38 g/L.";
      questions = [
        { text = "Classify the type of jaundice and explain the biochemistry."; modelAnswer = "Cholestatic (post-hepatic/obstructive) jaundice: predominantly conjugated (direct) bilirubin elevated, raised ALP and GGT (biliary enzymes), pale stools (no bilirubin reaching gut → no stercobilinogen), dark urine (conjugated bilirubin water-soluble → filtered by kidney → urobilinogen). Primary biliary cirrhosis = intrahepatic cholestasis." },
        { text = "Describe the pathway of bilirubin metabolism from haem to excretion."; modelAnswer = "Haem (from RBC breakdown) → biliverdin (haem oxygenase) → unconjugated bilirubin (biliverdin reductase) → bound to albumin in blood → liver → conjugated with glucuronic acid (UDP-glucuronosyltransferase) → bile → intestine → reduced by bacteria → urobilinogen → stercobilin (stools) or reabsorbed → urobilin (urine). Conjugated = direct = water soluble = excreted in urine." },
        { text = "What is the clinical significance of distinguishing unconjugated vs conjugated hyperbilirubinaemia?"; modelAnswer = "Unconjugated (indirect) hyperbilirubinaemia: haemolysis, Gilbert's syndrome, Crigler-Najjar, neonatal jaundice. Unconjugated crosses BBB → kernicterus in neonates. Conjugated (direct) hyperbilirubinaemia: hepatocellular disease or cholestasis; conjugated is water-soluble → dark urine; bile duct obstruction needs imaging (USS, MRCP)." },
      ];
      learningPoints = [
        "Three types of jaundice: pre-hepatic (haemolysis — unconjugated ↑, no dark urine), hepatocellular (mixed picture, ALT/AST ↑), cholestatic (conjugated ↑, ALP/GGT ↑, pale stools, dark urine).",
        "UDP-glucuronosyltransferase (UGT1A1) conjugates bilirubin with glucuronic acid in the liver ER, making it water-soluble for biliary excretion.",
        "Gilbert's syndrome: mild UGT1A1 deficiency, benign, precipitated by fasting/illness — unconjugated hyperbilirubinaemia, normal liver enzymes.",
        "ALP and GGT elevated in cholestasis; ALT and AST elevated in hepatocellular injury. Isolated ALP rise with normal GGT suggests bone disease (not liver)."
      ];
      subjectTags = [3, 1];
      difficulty = #medium;
    });
  };
};

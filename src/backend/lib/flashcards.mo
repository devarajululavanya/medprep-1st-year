import List "mo:core/List";
import Map "mo:core/Map";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import FTypes "../types/flashcards";
import CTypes "../types/curriculum";
import Common "../types/common";

module {
  let nanosPerDay : Int = 86_400_000_000_000;

  func floatToNat(f : Float) : Nat {
    let i = (f + 0.5).toInt();
    if (i < 0) 0 else Int.abs(i)
  };

  public func getFlashcards(
    cards : List.List<FTypes.Flashcard>,
    topicId : CTypes.TopicId,
  ) : [FTypes.Flashcard] {
    cards.filter(func(c) { c.topicId == topicId }).toArray()
  };

  public func getDueFlashcards(
    cards : List.List<FTypes.Flashcard>,
    progressMap : Map.Map<Principal, List.List<FTypes.FlashcardProgress>>,
    caller : Principal,
    now : Common.Timestamp,
  ) : [FTypes.Flashcard] {
    let userProgress = switch (progressMap.get(caller)) {
      case (?p) p;
      case null List.empty<FTypes.FlashcardProgress>();
    };
    cards.filter(func(card) {
      switch (userProgress.find(func(fp) { fp.flashcardId == card.id })) {
        case null true; // new card → due
        case (?fp) fp.dueDate <= now;
      }
    }).toArray()
  };

  // SM-2 spaced repetition algorithm
  public func reviewFlashcard(
    cards : List.List<FTypes.Flashcard>,
    progressMap : Map.Map<Principal, List.List<FTypes.FlashcardProgress>>,
    caller : Principal,
    cardId : FTypes.FlashcardId,
    rating : FTypes.ReviewRating,
    now : Common.Timestamp,
  ) {
    // Validate card exists
    switch (cards.find(func(c) { c.id == cardId })) {
      case null return;
      case (?_) {};
    };

    let userProgress = switch (progressMap.get(caller)) {
      case (?p) p;
      case null {
        let fresh = List.empty<FTypes.FlashcardProgress>();
        progressMap.add(caller, fresh);
        fresh
      };
    };

    let existing = userProgress.find(func(fp) { fp.flashcardId == cardId });
    let prev : FTypes.FlashcardProgress = switch (existing) {
      case (?fp) fp;
      case null {
        { flashcardId = cardId; status = #new_; easeFactor = 2.5; intervalDays = 0; dueDate = now; reviewCount = 0 }
      };
    };

    // Quality score: easy=5, good=3, hard=1
    let q : Float = switch (rating) {
      case (#easy) 5.0;
      case (#good) 3.0;
      case (#hard) 1.0;
    };

    // SM-2: new EF = EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02))
    let diff = 5.0 - q;
    let newEf = prev.easeFactor + (0.1 - diff * (0.08 + diff * 0.02));
    let ef = if (newEf < 1.3) 1.3 else newEf;

    let newInterval : Nat = switch (rating) {
      case (#hard) 1;
      case (#good) {
        if (prev.reviewCount == 0) 1
        else if (prev.reviewCount == 1) 6
        else {
          let f : Float = ef * prev.intervalDays.toFloat();
          floatToNat(f)
        }
      };
      case (#easy) {
        if (prev.reviewCount == 0) 4
        else {
          let f : Float = ef * prev.intervalDays.toFloat() * 1.3;
          floatToNat(f)
        }
      };
    };

    let newStatus : FTypes.FlashcardStatus = switch (rating) {
      case (#hard) #learning;
      case (#good) if (newInterval >= 21) #mastered else #learning;
      case (#easy) #mastered;
    };

    let nextDue : Common.Timestamp = now + newInterval.toInt() * nanosPerDay;
    let updated : FTypes.FlashcardProgress = {
      flashcardId = cardId;
      status = newStatus;
      easeFactor = ef;
      intervalDays = newInterval;
      dueDate = nextDue;
      reviewCount = prev.reviewCount + 1;
    };

    switch (existing) {
      case null userProgress.add(updated);
      case (?_) userProgress.mapInPlace(func(fp) {
        if (fp.flashcardId == cardId) updated else fp
      });
    };
  };

  public func seedFlashcards(cards : List.List<FTypes.Flashcard>) {
    // Topic 1 — Bones and Joints
    cards.add({ id = 1; topicId = 1; front = "What are the four types of bones by shape?"; back = "Long bones (femur), short bones (carpals), flat bones (skull), irregular bones (vertebrae). Sesamoid bones (patella) are sometimes added as a 5th category." });
    cards.add({ id = 2; topicId = 1; front = "What is the difference between a synarthrosis and a diarthrosis?"; back = "Synarthrosis = immovable joint (e.g. skull sutures). Diarthrosis = freely movable synovial joint (e.g. knee). Amphiarthrosis = slightly movable (e.g. pubic symphysis)." });
    cards.add({ id = 3; topicId = 1; front = "What cells resorb bone and what cells form bone?"; back = "Osteoclasts (derived from monocytes) resorb bone. Osteoblasts (derived from mesenchymal stem cells) form bone. Osteocytes are mature osteoblasts embedded in bone matrix." });
    cards.add({ id = 4; topicId = 1; front = "Name the bones of the wrist (carpals) in order."; back = "Proximal row: Scaphoid, Lunate, Triquetrum, Pisiform. Distal row: Trapezium, Trapezoid, Capitate, Hamate. Mnemonic: 'Some Lovers Try Positions That They Can't Handle'." });

    // Topic 2 — Muscles and Tendons
    cards.add({ id = 5; topicId = 2; front = "What is the difference between slow-twitch (Type I) and fast-twitch (Type II) muscle fibres?"; back = "Type I (slow, oxidative): fatigue resistant, many mitochondria, red colour, suited for endurance. Type II (fast, glycolytic): powerful but fatigue quickly, fewer mitochondria, white, suited for sprinting." });
    cards.add({ id = 6; topicId = 2; front = "Describe the sliding filament theory of muscle contraction."; back = "Myosin heads bind actin filaments, using ATP hydrolysis to 'walk' actin towards the M-line. This shortens sarcomeres. Calcium (from SR) exposes actin binding sites by moving tropomyosin off the troponin complex." });
    cards.add({ id = 7; topicId = 2; front = "What is the role of tropomyosin and troponin in muscle contraction?"; back = "At rest, tropomyosin blocks myosin-binding sites on actin. Troponin C binds Ca2+ (released from SR), shifting tropomyosin to expose binding sites — allowing cross-bridge formation and contraction." });

    // Topic 3 — Cardiovascular Anatomy
    cards.add({ id = 8; topicId = 3; front = "Name the four valves of the heart and their locations."; back = "Tricuspid (R atrium to R ventricle), Pulmonary (R ventricle to pulmonary artery), Mitral/Bicuspid (L atrium to L ventricle), Aortic (L ventricle to aorta). 'Try Pulling My Aorta'." });
    cards.add({ id = 9; topicId = 3; front = "What is the conducting system of the heart in order?"; back = "SA node → AV node → Bundle of His → Left and Right bundle branches → Purkinje fibres → ventricular myocardium. Intrinsic rates: SA 60-100, AV 40-60, Purkinje 20-40 bpm." });
    cards.add({ id = 10; topicId = 3; front = "Which cardiac chamber has the thickest wall and why?"; back = "The left ventricle has the thickest wall (~11 mm) because it pumps blood against the high systemic circulation resistance. The right ventricle (~3 mm) pumps against lower pulmonary resistance." });

    // Topic 4 — Nervous System Anatomy
    cards.add({ id = 11; topicId = 4; front = "What are the three meningeal layers from outer to inner?"; back = "Dura mater (tough outer), Arachnoid mater (middle), Pia mater (inner, closely adherent to brain). CSF flows in the subarachnoid space between arachnoid and pia." });
    cards.add({ id = 12; topicId = 4; front = "What does the cerebellum control?"; back = "Coordination of voluntary movement, balance, posture, and motor learning. Cerebellar lesions cause ipsilateral signs: ataxia, intention tremor, dysmetria, dysdiadochokinesia, nystagmus." });
    cards.add({ id = 13; topicId = 4; front = "Describe the dermatomes for C5, T4, L4, and S1."; back = "C5: lateral arm. T4: nipple level. L4: medial leg and great toe. S1: lateral foot and small toe. Useful clinical landmarks for assessing spinal cord/nerve root lesions." });

    // Topic 5 — Abdominal Organs
    cards.add({ id = 14; topicId = 5; front = "What are the functions of the liver?"; back = "Metabolism (glucose, lipids, proteins), bile production, detoxification (drugs, ammonia), plasma protein synthesis (albumin, clotting factors), vitamin storage (A, D, B12, iron), immune function (Kupffer cells)." });
    cards.add({ id = 15; topicId = 5; front = "What is the McBurney's point and its clinical significance?"; back = "McBurney's point is 1/3 of the way from the ASIS to the umbilicus — the surface marking of the base of the appendix. Tenderness here is a classic sign of acute appendicitis." });
    cards.add({ id = 16; topicId = 5; front = "What are the retroperitoneal structures (SAD PUCKER)?"; back = "Suprarenal glands, Aorta/IVC, Duodenum (2nd-4th), Pancreas (body/tail), Ureters, Colon (ascending and descending), Kidneys, Oesophagus, Rectum." });

    // Topic 6 — Cardiac Physiology
    cards.add({ id = 17; topicId = 6; front = "What is preload, afterload, and contractility?"; back = "Preload: ventricular EDV (stretch before contraction). Afterload: resistance ventricle pumps against (aortic pressure). Contractility (inotropy): intrinsic force of contraction independent of preload/afterload." });
    cards.add({ id = 18; topicId = 6; front = "Describe the phases of the cardiac cycle."; back = "1) Isovolumetric contraction, 2) Rapid ejection, 3) Reduced ejection, 4) Isovolumetric relaxation, 5) Rapid filling, 6) Reduced filling, 7) Atrial systole (final filling). S1=mitral/tricuspid close; S2=aortic/pulmonary close." });
    cards.add({ id = 19; topicId = 6; front = "What is ejection fraction and what is a normal value?"; back = "EF = (EDV - ESV) / EDV x 100 = SV/EDV x 100. Normal EF >= 55%. Heart failure with reduced EF (HFrEF) = EF < 40%. EF is a key marker of systolic function." });

    // Topic 7 — Respiratory Physiology
    cards.add({ id = 20; topicId = 7; front = "Define the four lung volumes and four capacities."; back = "Volumes: TV (500 mL), IRV (~3000), ERV (~1200), RV (~1200). Capacities: TLC=all; VC=TV+IRV+ERV; IC=TV+IRV; FRC=ERV+RV. RV cannot be measured by spirometry." });
    cards.add({ id = 21; topicId = 7; front = "What is the V/Q ratio and what is the normal value?"; back = "V/Q = alveolar ventilation / perfusion. Normal overall V/Q ~0.8. V/Q = 0 (shunt: perfused but not ventilated). V/Q = infinity (dead space: ventilated but not perfused)." });
    cards.add({ id = 22; topicId = 7; front = "Describe the oxyhaemoglobin dissociation curve shifts."; back = "Right shift (reduced O2 affinity, more O2 offloading): increased CO2, H+, temperature, 2,3-DPG. Left shift (increased O2 affinity): fetal Hb (HbF), decreased CO2, H+, temperature, 2,3-DPG, CO poisoning." });

    // Topic 8 — Renal Physiology
    cards.add({ id = 23; topicId = 8; front = "What is the renin-angiotensin-aldosterone system (RAAS)?"; back = "Low BP/Na → kidney releases renin → cleaves angiotensinogen to Ang I → ACE converts to Ang II → vasoconstriction + aldosterone release → Na/water retention → increased BP. RAAS target for antihypertensives." });
    cards.add({ id = 24; topicId = 8; front = "What is the significance of the counter-current multiplier in the loop of Henle?"; back = "The ascending limb actively pumps NaCl out (but is impermeable to water), making the medullary interstitium hypertonic. This drives water reabsorption from the thin descending limb and collecting duct (with ADH), concentrating urine." });
    cards.add({ id = 25; topicId = 8; front = "How does the kidney regulate acid-base balance?"; back = "H+ secretion (mainly as NH4+ and titratable acid), HCO3- reabsorption (PCT), and HCO3- generation (intercalated cells in collecting duct). Renal compensation is slow (hours-days) vs respiratory (minutes)." });

    // Topic 9 — Nerve and Muscle Physiology
    cards.add({ id = 26; topicId = 9; front = "Describe the steps of synaptic transmission."; back = "1) Action potential arrives at terminal, 2) Ca2+ influx via VGCCs, 3) vesicle fusion and NT release, 4) NT binds post-synaptic receptor, 5) EPSP/IPSP generated, 6) NT removed by reuptake/degradation/diffusion." });
    cards.add({ id = 27; topicId = 9; front = "What is the refractory period and what causes it?"; back = "Absolute refractory period: no AP possible (Na+ channels inactivated). Relative refractory period: AP possible with stronger stimulus (K+ channels open, hyperpolarisation). Ensures AP propagates in one direction." });
    cards.add({ id = 28; topicId = 9; front = "Compare A-alpha, A-delta, and C fibres."; back = "Aalpha: largest, myelinated, fastest (70-120 m/s), proprioception/motor. Adelta: myelinated, fast (5-30 m/s), sharp pain, cold. C: unmyelinated, slowest (0.5-2 m/s), dull/burning pain, warmth, postganglionic autonomic." });

    // Topic 10 — Endocrine Physiology
    cards.add({ id = 29; topicId = 10; front = "What are the effects of cortisol on metabolism?"; back = "Catabolic: raises blood glucose (gluconeogenesis, insulin resistance), lipolysis, protein catabolism. Anti-inflammatory: suppresses cytokines, inhibits phospholipase A2 (via lipocortin). Released from adrenal cortex zona fasciculata." });
    cards.add({ id = 30; topicId = 10; front = "What is the difference between type 1 and type 2 diabetes mellitus pathophysiology?"; back = "T1DM: autoimmune destruction of beta-cells → absolute insulin deficiency, ketoacidosis-prone. T2DM: insulin resistance + relative beta-cell insufficiency → hyperglycaemia without early ketoacidosis. T2 more gradual onset." });
    cards.add({ id = 31; topicId = 10; front = "What is the G-protein coupled receptor signalling pathway (Gs)?"; back = "Hormone binds GPCR → Gs activates adenylyl cyclase → increased cAMP → activates PKA → phosphorylates target proteins. Examples: glucagon, adrenaline (beta-receptor), TSH, LH, FSH, PTH. Gi inhibits adenylyl cyclase." });

    // Topic 11 — Carbohydrate Metabolism
    cards.add({ id = 32; topicId = 11; front = "What is the Cori cycle?"; back = "Muscle converts glucose → lactate (anaerobic glycolysis) → released into blood → liver takes up lactate → gluconeogenesis → glucose returned to blood → muscle. Net: transfers metabolic burden from muscle to liver." });
    cards.add({ id = 33; topicId = 11; front = "Name the three irreversible steps in glycolysis and their enzymes."; back = "1) Glucose → G6P (hexokinase/glucokinase). 2) F6P → F1,6-bisP (PFK-1, rate-limiting). 3) PEP → pyruvate (pyruvate kinase). These are bypassed in gluconeogenesis by different enzymes." });
    cards.add({ id = 34; topicId = 11; front = "What is glycogen and where is it stored?"; back = "Glycogen = branched polymer of glucose (alpha-1,4 glycosidic bonds, branched by alpha-1,6 bonds). Stored in liver (maintains blood glucose) and muscle (local energy). Glycogen synthase adds glucose; glycogen phosphorylase releases glucose-1-phosphate." });

    // Topic 12 — Protein Metabolism
    cards.add({ id = 35; topicId = 12; front = "What are essential amino acids? Give examples."; back = "Essential AAs cannot be synthesised by the body and must come from diet. Mnemonic 'PVT TIM HaLL': Phenylalanine, Valine, Threonine, Tryptophan, Isoleucine, Methionine, Histidine, Arginine, Leucine, Lysine." });
    cards.add({ id = 36; topicId = 12; front = "What are the key intermediates in the urea cycle?"; back = "NH3 + CO2 → carbamoyl phosphate → citrulline (mitochondria) → argininosuccinate → arginine → urea + ornithine (regenerated). Ornithine and citrulline cycle in and out of mitochondria." });
    cards.add({ id = 37; topicId = 12; front = "What is hyperammonaemia and its neurological significance?"; back = "Elevated blood ammonia (from liver failure or urea cycle defects) → cerebral oedema, encephalopathy. NH3 depletes alpha-ketoglutarate (via glutamate/glutamine synthesis) → reduces TCA cycle and ATP → astrocyte swelling." });

    // Topic 13 — Lipid Metabolism
    cards.add({ id = 38; topicId = 13; front = "What is the role of carnitine in fatty acid metabolism?"; back = "Carnitine (from lysine/methionine + vitamin C) transports long-chain fatty acids across the inner mitochondrial membrane as acylcarnitine, via carnitine palmitoyltransferase (CPT-I and CPT-II). Required for beta-oxidation." });
    cards.add({ id = 39; topicId = 13; front = "What are the differences between LDL and HDL?"; back = "LDL ('bad'): carries cholesterol from liver to tissues; high levels → atherosclerosis. HDL ('good'): reverse cholesterol transport (tissues → liver for excretion); high levels protective. LDL oxidation initiates atherogenesis." });
    cards.add({ id = 40; topicId = 13; front = "What is the rate-limiting step of cholesterol synthesis and how is it regulated?"; back = "HMG-CoA reductase (converts HMG-CoA to mevalonate) is rate-limiting. Inhibited by statins, high intracellular cholesterol, and glucagon/cortisol. Activated by insulin. Statins are first-line therapy for hypercholesterolaemia." });

    // Topic 14 — Enzymes and Coenzymes
    cards.add({ id = 41; topicId = 14; front = "What is the difference between a coenzyme and a prosthetic group?"; back = "Coenzyme: loosely bound organic cofactor (easily dissociable), e.g. NAD+, FAD, CoA. Prosthetic group: tightly (often covalently) bound, e.g. haem in haemoglobin/cytochromes, biotin in carboxylases. Both are non-protein cofactors." });
    cards.add({ id = 42; topicId = 14; front = "What is allosteric regulation of enzymes?"; back = "Allosteric enzymes have regulatory sites distinct from the active site. Binding of effectors causes conformational change → alter enzyme activity. Positive effectors activate; negative effectors inhibit. Example: PFK-1 inhibited by ATP/citrate, activated by AMP." });
    cards.add({ id = 43; topicId = 14; front = "Define enzyme specificity and give examples of types."; back = "Absolute specificity: acts on one substrate only (urease/urea). Group specificity: acts on similar substrates with same functional group (hexokinase/glucose and fructose). Stereospecificity: L-amino acid oxidase acts only on L-amino acids." });

    // Topic 15 — Nucleotide Metabolism
    cards.add({ id = 44; topicId = 15; front = "What is the difference between purines and pyrimidines?"; back = "Purines (double ring): Adenine, Guanine. Pyrimidines (single ring): Cytosine, Thymine (DNA only), Uracil (RNA only). Mnemonic: Purines = Pure As Gold (PAG), CUT the PYrimidines (CUT = C, U, T)." });
    cards.add({ id = 45; topicId = 15; front = "What is the salvage pathway for purines?"; back = "Purines released from nucleic acid catabolism are recycled: HGPRT converts hypoxanthine/guanine → IMP/GMP. APRT converts adenine → AMP. Lesch-Nyhan syndrome = HGPRT deficiency → self-mutilation, gout, intellectual disability." });
    cards.add({ id = 46; topicId = 15; front = "How does 5-fluorouracil (5-FU) work as a chemotherapy agent?"; back = "5-FU is a pyrimidine analogue that inhibits thymidylate synthase (TS) — the enzyme that converts dUMP → dTMP using N5,N10-methylene-THF. This blocks DNA synthesis preferentially in rapidly dividing cancer cells." });
  };
};

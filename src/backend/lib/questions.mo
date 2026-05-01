import List "mo:core/List";
import QTypes "../types/questions";
import CTypes "../types/curriculum";

module {
  public func getQuestions(
    questions : List.List<QTypes.Question>,
    topicId : CTypes.TopicId,
  ) : [QTypes.Question] {
    questions.filter(func(q) { q.topicId == topicId }).toArray()
  };

  public func getQuestion(
    questions : List.List<QTypes.Question>,
    id : QTypes.QuestionId,
  ) : ?QTypes.Question {
    questions.find(func(q) { q.id == id })
  };

  public func markFlagged(
    questions : List.List<QTypes.Question>,
    id : QTypes.QuestionId,
  ) {
    questions.mapInPlace(func(q) {
      if (q.id == id) { { q with isFlagged = not q.isFlagged } } else { q }
    })
  };

  public func addQuestion(
    questions : List.List<QTypes.Question>,
    question : QTypes.Question,
  ) {
    questions.add(question)
  };

  public func nextId(questions : List.List<QTypes.Question>) : Nat {
    questions.size() + 1
  };

  public func seedQuestions(questions : List.List<QTypes.Question>) {
    // Topic 1 — Bones and Joints
    questions.add({ id = 1; topicId = 1; text = "Which type of joint allows the greatest range of motion?"; options = ["Fibrous joint", "Cartilaginous joint", "Synovial joint", "Gomphosis"]; correctIndex = 2; explanation = "Synovial joints (e.g., shoulder, hip) are freely movable diarthroses that allow the widest range of motion due to their articular cartilage and synovial fluid."; isFlagged = false; source = #manual });
    questions.add({ id = 2; topicId = 1; text = "The epiphyseal plate is responsible for:"; options = ["Bone remodelling", "Longitudinal bone growth", "Compact bone formation", "Periosteum attachment"]; correctIndex = 1; explanation = "The epiphyseal (growth) plate is a cartilaginous layer between the epiphysis and diaphysis that enables longitudinal growth in long bones."; isFlagged = false; source = #manual });
    questions.add({ id = 3; topicId = 1; text = "Which bone is NOT part of the axial skeleton?"; options = ["Sternum", "Vertebra", "Femur", "Skull"]; correctIndex = 2; explanation = "The femur is a long bone of the lower limb and belongs to the appendicular skeleton, not the axial skeleton."; isFlagged = false; source = #manual });
    questions.add({ id = 4; topicId = 1; text = "Haversian canals are found in:"; options = ["Cancellous bone", "Compact bone", "Cartilage", "Periosteum"]; correctIndex = 1; explanation = "Haversian canals are central channels in osteons of compact (cortical) bone, carrying blood vessels and nerves."; isFlagged = false; source = #manual });

    // Topic 2 — Muscles and Tendons
    questions.add({ id = 5; topicId = 2; text = "The rotator cuff is formed by which group of muscles?"; options = ["Deltoid, biceps, triceps, brachialis", "Supraspinatus, infraspinatus, teres minor, subscapularis", "Pectoralis major, minor, serratus anterior, coracobrachialis", "Trapezius, rhomboids, levator scapulae, latissimus dorsi"]; correctIndex = 1; explanation = "The rotator cuff consists of SITS muscles: Supraspinatus, Infraspinatus, Teres minor, and Subscapularis — they stabilise the glenohumeral joint."; isFlagged = false; source = #manual });
    questions.add({ id = 6; topicId = 2; text = "Which muscle is the prime mover for elbow flexion?"; options = ["Triceps brachii", "Brachioradialis", "Brachialis", "Coracobrachialis"]; correctIndex = 2; explanation = "Brachialis is the most powerful elbow flexor as it acts purely in flexion regardless of forearm position, unlike biceps brachii which is also a supinator."; isFlagged = false; source = #manual });
    questions.add({ id = 7; topicId = 2; text = "Tendons connect:"; options = ["Bone to bone", "Muscle to bone", "Muscle to muscle", "Cartilage to bone"]; correctIndex = 1; explanation = "Tendons are dense regular connective tissue bands that connect muscle to bone, transmitting force to produce movement."; isFlagged = false; source = #manual });
    questions.add({ id = 8; topicId = 2; text = "Which nerve supplies the diaphragm?"; options = ["Vagus nerve (CN X)", "Phrenic nerve (C3,4,5)", "Intercostal nerves", "Thoracic splanchnic nerves"]; correctIndex = 1; explanation = "The phrenic nerve (C3, C4, C5 — 'keeps the diaphragm alive') is the motor and sensory supply to the diaphragm."; isFlagged = false; source = #manual });

    // Topic 3 — Cardiovascular Anatomy
    questions.add({ id = 9; topicId = 3; text = "The mitral valve separates which two chambers?"; options = ["Right atrium and right ventricle", "Left atrium and left ventricle", "Right ventricle and pulmonary artery", "Left ventricle and aorta"]; correctIndex = 1; explanation = "The mitral (bicuspid) valve is located between the left atrium and left ventricle, preventing regurgitation during systole."; isFlagged = false; source = #manual });
    questions.add({ id = 10; topicId = 3; text = "The sinoatrial (SA) node is located in:"; options = ["Left atrium near the mitral valve", "Right atrium near the SVC", "Interventricular septum", "Right ventricle apex"]; correctIndex = 1; explanation = "The SA node is the heart's natural pacemaker, located in the posterior wall of the right atrium near the opening of the superior vena cava."; isFlagged = false; source = #manual });
    questions.add({ id = 11; topicId = 3; text = "Which artery supplies the anterior wall of the left ventricle?"; options = ["Right coronary artery", "Left circumflex artery", "Left anterior descending (LAD) artery", "Posterior descending artery"]; correctIndex = 2; explanation = "The LAD artery (also called the 'widow maker') supplies the anterior wall of the left ventricle, anterior interventricular septum, and apex."; isFlagged = false; source = #manual });
    questions.add({ id = 12; topicId = 3; text = "In the fetal circulation, the ductus arteriosus connects:"; options = ["Pulmonary artery to aorta", "Left and right atria", "Umbilical vein to IVC", "Pulmonary veins to left atrium"]; correctIndex = 0; explanation = "The ductus arteriosus bypasses the lungs by connecting the pulmonary artery to the descending aorta, normally closing at birth to form the ligamentum arteriosum."; isFlagged = false; source = #manual });

    // Topic 4 — Nervous System Anatomy
    questions.add({ id = 13; topicId = 4; text = "Which cranial nerve is responsible for the majority of parasympathetic supply to thoracic and abdominal viscera?"; options = ["CN III (Oculomotor)", "CN VII (Facial)", "CN IX (Glossopharyngeal)", "CN X (Vagus)"]; correctIndex = 3; explanation = "The vagus nerve (CN X) provides parasympathetic innervation to the heart, lungs, and most abdominal organs down to the splenic flexure of the colon."; isFlagged = false; source = #manual });
    questions.add({ id = 14; topicId = 4; text = "The blood-brain barrier (BBB) is formed primarily by:"; options = ["Pia mater cells", "Astrocyte end-feet and tight junctions of endothelial cells", "Oligodendrocyte sheaths", "Microglia"]; correctIndex = 1; explanation = "The BBB is maintained by tight junctions between cerebral capillary endothelial cells, supported by astrocytic end-feet, limiting paracellular permeability."; isFlagged = false; source = #manual });
    questions.add({ id = 15; topicId = 4; text = "The dorsal columns of the spinal cord carry:"; options = ["Pain and temperature", "Proprioception and fine touch", "Motor commands", "Autonomic signals"]; correctIndex = 1; explanation = "The dorsal (posterior) columns (fasciculus gracilis and cuneatus) convey proprioception, vibration, two-point discrimination, and fine touch ipsilaterally."; isFlagged = false; source = #manual });

    // Topic 5 — Abdominal Organs
    questions.add({ id = 16; topicId = 5; text = "The portal triad in the liver consists of:"; options = ["Portal vein, hepatic artery, bile duct", "Hepatic vein, portal vein, lymphatic", "Sinusoid, bile canaliculus, hepatic vein", "Portal vein, central vein, bile duct"]; correctIndex = 0; explanation = "Each portal triad contains a branch of the portal vein, hepatic artery proper, and bile duct, located at the corner of liver lobules."; isFlagged = false; source = #manual });
    questions.add({ id = 17; topicId = 5; text = "The spleen is located in which abdominal region?"; options = ["Right hypochondrium", "Epigastric region", "Left hypochondrium", "Left iliac fossa"]; correctIndex = 2; explanation = "The spleen lies in the left hypochondrium, protected by the 9th-11th ribs, adjacent to the stomach, left kidney, and splenic flexure of the colon."; isFlagged = false; source = #manual });
    questions.add({ id = 18; topicId = 5; text = "Which structure marks the junction between the foregut and midgut?"; options = ["Pylorus of stomach", "Duodenojejunal flexure", "Entry of common bile duct into duodenum", "Ileocaecal junction"]; correctIndex = 2; explanation = "The entry of the common bile duct (at the major duodenal papilla, mid-descending duodenum) marks the embryological foregut-midgut boundary."; isFlagged = false; source = #manual });

    // Topic 6 — Cardiac Physiology
    questions.add({ id = 19; topicId = 6; text = "Cardiac output is calculated as:"; options = ["Stroke volume × heart rate", "End-diastolic volume − end-systolic volume", "Preload × afterload", "Pulse pressure × heart rate"]; correctIndex = 0; explanation = "Cardiac output (CO) = Stroke Volume (SV) × Heart Rate (HR). Normal resting CO ≈ 5 L/min."; isFlagged = false; source = #manual });
    questions.add({ id = 20; topicId = 6; text = "The QRS complex on ECG represents:"; options = ["Atrial depolarisation", "Ventricular repolarisation", "Ventricular depolarisation", "AV node delay"]; correctIndex = 2; explanation = "The QRS complex (duration < 0.12 s) represents depolarisation of the ventricular myocardium, triggering ventricular systole."; isFlagged = false; source = #manual });
    questions.add({ id = 21; topicId = 6; text = "Frank-Starling law states that:"; options = ["Heart rate increases with sympathetic stimulation", "Stroke volume increases with increased ventricular end-diastolic volume", "Afterload reduces stroke volume", "Contractility is independent of fibre length"]; correctIndex = 1; explanation = "Frank-Starling law: within physiological limits, the force of ventricular contraction is proportional to the initial stretch (preload), i.e. increased EDV → increased SV."; isFlagged = false; source = #manual });

    // Topic 7 — Respiratory Physiology
    questions.add({ id = 22; topicId = 7; text = "The main stimulus for breathing under normal conditions is:"; options = ["Low PaO2", "Rising PaCO2 and falling pH", "Low haemoglobin saturation", "Stretch of lung parenchyma"]; correctIndex = 1; explanation = "Central chemoreceptors in the medulla primarily respond to changes in CSF pH (driven by PaCO2), making rising PaCO2 the dominant normal respiratory stimulus."; isFlagged = false; source = #manual });
    questions.add({ id = 23; topicId = 7; text = "Functional Residual Capacity (FRC) equals:"; options = ["Tidal volume + inspiratory reserve volume", "Expiratory reserve volume + residual volume", "Total lung capacity − vital capacity", "Inspiratory capacity + residual volume"]; correctIndex = 1; explanation = "FRC = ERV + RV — the volume remaining in the lungs at the end of a normal tidal expiration, the equilibrium point of lung and chest wall recoil forces."; isFlagged = false; source = #manual });
    questions.add({ id = 24; topicId = 7; text = "Oxygen is primarily transported in blood as:"; options = ["Dissolved in plasma", "Combined with haemoglobin", "Carbamino compounds", "Bicarbonate ions"]; correctIndex = 1; explanation = "~98% of oxygen is carried as oxyhaemoglobin (HbO2); only ~2% is dissolved in plasma. CO2, in contrast, is mainly transported as bicarbonate."; isFlagged = false; source = #manual });

    // Topic 8 — Renal Physiology
    questions.add({ id = 25; topicId = 8; text = "The normal Glomerular Filtration Rate (GFR) in an adult is approximately:"; options = ["25 mL/min", "60 mL/min", "125 mL/min", "200 mL/min"]; correctIndex = 2; explanation = "Normal GFR ≈ 125 mL/min (180 L/day). Most of this is reabsorbed; only ~1.5 L becomes urine daily."; isFlagged = false; source = #manual });
    questions.add({ id = 26; topicId = 8; text = "Aldosterone acts primarily on which nephron segment?"; options = ["Proximal convoluted tubule", "Loop of Henle (thick ascending limb)", "Distal convoluted tubule and collecting duct", "Glomerulus"]; correctIndex = 2; explanation = "Aldosterone stimulates Na⁺ reabsorption and K⁺ secretion in the principal cells of the distal nephron and collecting duct, regulated by the renin-angiotensin-aldosterone system."; isFlagged = false; source = #manual });
    questions.add({ id = 27; topicId = 8; text = "In metabolic acidosis, the kidney compensates by:"; options = ["Retaining bicarbonate and excreting H⁺", "Excreting bicarbonate", "Retaining CO2", "Reducing ammonia production"]; correctIndex = 0; explanation = "In metabolic acidosis, the kidneys increase H⁺ excretion (as NH4⁺ and titratable acid) and enhance HCO3⁻ reabsorption and regeneration to restore pH."; isFlagged = false; source = #manual });

    // Topic 9 — Nerve and Muscle Physiology
    questions.add({ id = 28; topicId = 9; text = "The resting membrane potential of a typical neuron is approximately:"; options = ["+40 mV", "-90 mV", "-70 mV", "0 mV"]; correctIndex = 2; explanation = "The resting membrane potential is approximately −70 mV, maintained by the Na⁺/K⁺-ATPase pump and selective permeability to K⁺ through leak channels."; isFlagged = false; source = #manual });
    questions.add({ id = 29; topicId = 9; text = "The neurotransmitter at the neuromuscular junction is:"; options = ["Noradrenaline", "Dopamine", "Acetylcholine", "Serotonin"]; correctIndex = 2; explanation = "Acetylcholine (ACh) is released from motor nerve terminals and binds nicotinic receptors on the motor end plate, initiating muscle action potential and contraction."; isFlagged = false; source = #manual });
    questions.add({ id = 30; topicId = 9; text = "All-or-none law applies to:"; options = ["Graded potentials", "Receptor potentials", "Action potentials", "End-plate potentials"]; correctIndex = 2; explanation = "Once the threshold is reached, an action potential fires at full amplitude regardless of stimulus strength — it is all-or-none. Graded potentials are proportional to stimulus."; isFlagged = false; source = #manual });

    // Topic 10 — Endocrine Physiology
    questions.add({ id = 31; topicId = 10; text = "Insulin is secreted by which cells of the pancreas?"; options = ["Alpha cells", "Beta cells", "Delta cells", "PP cells"]; correctIndex = 1; explanation = "Beta cells (β-cells) in the islets of Langerhans secrete insulin in response to elevated blood glucose, promoting glucose uptake and storage."; isFlagged = false; source = #manual });
    questions.add({ id = 32; topicId = 10; text = "Negative feedback in the hypothalamic-pituitary-thyroid axis means:"; options = ["High T3/T4 stimulates more TSH release", "High T3/T4 inhibits TRH and TSH release", "Low TSH stimulates thyroid hormone production", "TRH directly inhibits T4 production"]; correctIndex = 1; explanation = "High circulating T3 and T4 feed back negatively to inhibit TRH release from the hypothalamus and TSH from the anterior pituitary, maintaining hormonal homeostasis."; isFlagged = false; source = #manual });
    questions.add({ id = 33; topicId = 10; text = "Antidiuretic hormone (ADH) increases water reabsorption by inserting which channels?"; options = ["GLUT4 transporters", "Aquaporin-2 channels", "CFTR channels", "Na⁺/K⁺ ATPase pumps"]; correctIndex = 1; explanation = "ADH (vasopressin) binds V2 receptors on collecting duct principal cells, triggering insertion of aquaporin-2 (AQP2) water channels to increase water permeability and reabsorption."; isFlagged = false; source = #manual });

    // Topic 11 — Carbohydrate Metabolism
    questions.add({ id = 34; topicId = 11; text = "The net ATP yield from complete aerobic oxidation of one glucose molecule is approximately:"; options = ["2 ATP", "8 ATP", "30-32 ATP", "38 ATP"]; correctIndex = 2; explanation = "Modern estimates give ~30-32 ATP from complete oxidation of glucose (glycolysis 2 ATP + 2 NADH → TCA 6 NADH + 2 FADH2 + 2 GTP + oxidative phosphorylation)."; isFlagged = false; source = #manual });
    questions.add({ id = 35; topicId = 11; text = "The rate-limiting enzyme of glycolysis is:"; options = ["Hexokinase", "Phosphofructokinase-1 (PFK-1)", "Pyruvate kinase", "Glucose-6-phosphatase"]; correctIndex = 1; explanation = "PFK-1 is the key regulatory enzyme of glycolysis, inhibited by ATP and citrate and activated by AMP, ADP, and fructose-2,6-bisphosphate."; isFlagged = false; source = #manual });
    questions.add({ id = 36; topicId = 11; text = "Gluconeogenesis occurs primarily in the:"; options = ["Skeletal muscle", "Adipose tissue", "Liver", "Brain"]; correctIndex = 2; explanation = "The liver (and to a lesser extent kidneys) is the main site of gluconeogenesis, converting pyruvate, lactate, amino acids, and glycerol to glucose during fasting."; isFlagged = false; source = #manual });

    // Topic 12 — Protein Metabolism
    questions.add({ id = 37; topicId = 12; text = "The urea cycle takes place in which organ?"; options = ["Kidney", "Skeletal muscle", "Liver", "Small intestine"]; correctIndex = 2; explanation = "The urea cycle occurs primarily in hepatocytes (liver), detoxifying ammonia by converting it to urea for excretion."; isFlagged = false; source = #manual });
    questions.add({ id = 38; topicId = 12; text = "Transamination reactions require which vitamin as a coenzyme?"; options = ["Thiamine (B1)", "Pyridoxine (B6)", "Cobalamin (B12)", "Riboflavin (B2)"]; correctIndex = 1; explanation = "Pyridoxal phosphate (PLP), derived from vitamin B6, is the essential coenzyme for all aminotransferase (transaminase) reactions."; isFlagged = false; source = #manual });
    questions.add({ id = 39; topicId = 12; text = "A positive nitrogen balance is seen in:"; options = ["Starvation", "Protein deficiency", "Growth and pregnancy", "Severe burns"]; correctIndex = 2; explanation = "Positive nitrogen balance (nitrogen intake > excretion) occurs during anabolism — growth, pregnancy, and recovery from illness — when protein synthesis exceeds breakdown."; isFlagged = false; source = #manual });

    // Topic 13 — Lipid Metabolism
    questions.add({ id = 40; topicId = 13; text = "Beta-oxidation of fatty acids occurs in:"; options = ["Cytoplasm", "Mitochondrial matrix", "Smooth ER", "Peroxisomes only"]; correctIndex = 1; explanation = "Beta-oxidation primarily occurs in the mitochondrial matrix; very long-chain fatty acids are initially shortened in peroxisomes before mitochondrial oxidation."; isFlagged = false; source = #manual });
    questions.add({ id = 41; topicId = 13; text = "Ketone bodies are synthesized in the liver from:"; options = ["Glucose", "Amino acids", "Acetyl-CoA", "Glycerol"]; correctIndex = 2; explanation = "During fasting or uncontrolled diabetes, excess acetyl-CoA from fatty acid oxidation is converted to ketone bodies (acetoacetate, β-hydroxybutyrate, acetone) in liver mitochondria."; isFlagged = false; source = #manual });
    questions.add({ id = 42; topicId = 13; text = "Bile salts are synthesised from:"; options = ["Triglycerides", "Phospholipids", "Cholesterol", "Fatty acids"]; correctIndex = 2; explanation = "Bile acids are synthesised from cholesterol in the liver; conjugated with glycine or taurine to form bile salts that emulsify dietary fats in the small intestine."; isFlagged = false; source = #manual });

    // Topic 14 — Enzymes and Coenzymes
    questions.add({ id = 43; topicId = 14; text = "The Michaelis constant (Km) represents:"; options = ["Maximum reaction velocity", "Substrate concentration at half-maximal velocity", "Enzyme concentration at saturation", "Product inhibition constant"]; correctIndex = 1; explanation = "Km is the substrate concentration at which reaction velocity = Vmax/2. A low Km indicates high affinity of the enzyme for its substrate."; isFlagged = false; source = #manual });
    questions.add({ id = 44; topicId = 14; text = "Competitive inhibitors:"; options = ["Decrease Vmax with unchanged Km", "Increase apparent Km with unchanged Vmax", "Covalently modify the active site permanently", "Increase Vmax and decrease Km"]; correctIndex = 1; explanation = "Competitive inhibitors compete with substrate for the active site, raising apparent Km (reduced affinity) without changing Vmax (excess substrate can overcome inhibition)."; isFlagged = false; source = #manual });
    questions.add({ id = 45; topicId = 14; text = "NAD⁺ functions as a:"; options = ["Cosubstrate/electron carrier in oxidation reactions", "Metal ion activator", "Allosteric inhibitor", "Prosthetic group that stays tightly bound"]; correctIndex = 0; explanation = "NAD⁺ (nicotinamide adenine dinucleotide) is a cosubstrate that accepts two electrons (as NADH) in dehydrogenase reactions; NADH is reoxidised in the electron transport chain."; isFlagged = false; source = #manual });

    // Topic 15 — Nucleotide Metabolism
    questions.add({ id = 46; topicId = 15; text = "Purines are synthesised on which scaffold?"; options = ["Free purine base first, then ribose added", "Ribose-5-phosphate scaffold, built atom by atom", "Amino acid backbone", "Recycled cholesterol"]; correctIndex = 1; explanation = "De novo purine synthesis builds the purine ring atom-by-atom on ribose-5-phosphate (from the pentose phosphate pathway), using glutamine, glycine, CO2, and folate."; isFlagged = false; source = #manual });
    questions.add({ id = 47; topicId = 15; text = "Gout results from elevated levels of:"; options = ["Urea", "Creatinine", "Uric acid", "Bilirubin"]; correctIndex = 2; explanation = "Gout is caused by hyperuricemia — accumulation of uric acid (the end product of purine catabolism in humans) leading to monosodium urate crystal deposition in joints."; isFlagged = false; source = #manual });
    questions.add({ id = 48; topicId = 15; text = "The enzyme xanthine oxidase catalyses the final step in:"; options = ["Pyrimidine synthesis", "Purine catabolism", "DNA repair", "Ribonucleotide reductase reaction"]; correctIndex = 1; explanation = "Xanthine oxidase converts hypoxanthine → xanthine → uric acid, the final steps of purine catabolism. Allopurinol inhibits this enzyme to treat gout."; isFlagged = false; source = #manual });
  };
};

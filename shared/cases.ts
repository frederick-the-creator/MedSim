import { MedicalCase } from "./schema";

export const medicalCases: MedicalCase[] = [
  {
    id: 1,
    patientName: "Aoife O'Connor",
    age: 27,
    gender: "female",
    clinicType: "Eye Casualty",
    scenario: "Explain the likely diagnosis and management plan to the patient",
    task: "Explain the likely diagnosis and management plan to the patient",
    triageNote: "Right eye painful/red. Worse this morning.",
    agentId: "agent_9001k7a6wzgpf0psegzga9371m18",
    keyFindings: {
      "VA": "R 6/18 (pinhole 6/12), L 6/6",
      "External": "epiphora on the right",
      "Cornea (R)": "~2 mm paracentral epithelial defect with underlying stromal infiltrate; fluorescein positive; mild surrounding oedema; Seidel negative; no dendritic branching",
      "Anterior chamber (R)": "1+ cells, no hypopyon",
      "Pupil": "Round/reactive; no RAPD",
      "IOP": "R 12 mmHg, L 14 mmHg"
    },
    patientProfile: {
      background: "27-year-old contact lens wearer who woke up with severe right eye pain and redness",
      symptomDetails: [
        "Wears contact lenses daily",
        "Sometimes sleeps with lenses in",
        "Pain started overnight",
        "Vision is blurry in affected eye",
        "Light sensitivity"
      ],
      concerns: [
        "Worried about losing vision",
        "Needs to work (office job with computer)",
        "Has important presentation next week"
      ],
      expectations: [
        "Wants quick treatment",
        "Hopes to continue wearing contacts",
        "Concerned about time off work"
      ],
      personality: "Anxious but cooperative, asks relevant questions"
    }
  },
  {
    id: 2,
    patientName: "Adam Jones",
    age: 65,
    gender: "male",
    clinicType: "Glaucoma Clinic (New Patient)",
    scenario: "Explain to the patient the findings and initial management plan going forward",
    task: "Explain to the patient the findings and initial management plan going forward",
    triageNote: "Routine optician referral - high eye pressures detected",
    agentId: "agent_0501k7fhza4afxdsc4nkmqhgz7cv",
    keyFindings: {
      "VA": "R 6/9, L 6/9",
      "IOP": "R 28 mmHg, L 26 mmHg",
      "Gonioscopy": "Open angles bilaterally",
      "Optic disc": [
        "R: C/D ratio 0.7, inferior notching",
        "L: C/D ratio 0.6, diffuse thinning"
      ],
      "Visual fields": "Early superior arcuate defect right eye",
      "OCT": "RNFL thinning inferior quadrant right eye"
    },
    patientProfile: {
      background: "Retired engineer, referred by optician after routine eye test showed elevated pressures",
      symptomDetails: [
        "No symptoms noticed",
        "Regular optician visits",
        "Family history: father had glaucoma"
      ],
      concerns: [
        "Father went blind from glaucoma",
        "Worried about going blind",
        "Concerned about treatment side effects"
      ],
      expectations: [
        "Wants to preserve vision",
        "Needs clear explanation",
        "Concerned about eye drops affecting other health conditions"
      ],
      personality: "Methodical, likes detailed explanations, slightly worried"
    }
  },
  {
    id: 3,
    patientName: "Mary Davies",
    age: 70,
    gender: "female",
    clinicType: "Medical Retina Clinic",
    scenario: "Explain the findings and outline the management plan",
    task: "Explain the findings and outline the management plan",
    triageNote: "Follow-up for wet AMD - currently on anti-VEGF injections",
    agentId: "agent_2301k7h3fq7vfjfa1xcscjeykx93",
    keyFindings: {
      "VA": "R 6/60, L 6/12",
      "Amsler grid": "Central distortion right eye",
      "Fundoscopy (R)": "Subretinal fluid, intraretinal cysts, small hemorrhages",
      "OCT (R)": "Central macular thickness 420μm, subretinal and intraretinal fluid",
      "Previous treatment": "3 monthly ranibizumab injections"
    },
    patientProfile: {
      background: "Widowed, lives alone, diagnosed with wet AMD 4 months ago",
      symptomDetails: [
        "Central vision distorted in right eye",
        "Difficulty reading",
        "Can't see faces clearly",
        "Left eye compensating well"
      ],
      concerns: [
        "Will she go completely blind?",
        "How long will injections continue?",
        "Worried about being a burden to family",
        "Anxious about injections"
      ],
      expectations: [
        "Wants to maintain independence",
        "Hopes vision will improve",
        "Needs reassurance about prognosis"
      ],
      personality: "Stoic but anxious, appreciates empathy and clear communication"
    }
  }
];

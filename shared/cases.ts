import { MedicalCase } from "./schemas/case";

export const medicalCases: MedicalCase[] = [
	// {
	// 	id: 1,
	// 	patientName: "Aoife O'Connor",
	// 	age: 27,
	// 	gender: "female",
	// 	clinicType: "Eye Casualty",
	// 	scenario: "Explain the likely diagnosis and management plan to the patient",
	// 	task: "Explain the likely diagnosis and management plan to the patient",
	// 	triageNote: "Right eye painful/red. Worse this morning.",
	// 	agentId: "agent_9001k7a6wzgpf0psegzga9371m18",
	// 	keyFindings: {
	// 		VA: "R 6/18 (pinhole 6/12), L 6/6",
	// 		External: "epiphora on the right",
	// 		"Cornea (R)":
	// 			"~2 mm paracentral epithelial defect with underlying stromal infiltrate; fluorescein positive; mild surrounding oedema; Seidel negative; no dendritic branching",
	// 		"Anterior chamber (R)": "1+ cells, no hypopyon",
	// 		Pupil: "Round/reactive; no RAPD",
	// 		IOP: "R 12 mmHg, L 14 mmHg",
	// 	},
	// 	patientProfile: {
	// 		background:
	// 			"27-year-old contact lens wearer who woke up with severe right eye pain and redness",
	// 		symptomDetails: [
	// 			"Wears contact lenses daily",
	// 			"Sometimes sleeps with lenses in",
	// 			"Pain started overnight",
	// 			"Vision is blurry in affected eye",
	// 			"Light sensitivity",
	// 		],
	// 		concerns: [
	// 			"Worried about losing vision",
	// 			"Needs to work (office job with computer)",
	// 			"Has important presentation next week",
	// 		],
	// 		expectations: [
	// 			"Wants quick treatment",
	// 			"Hopes to continue wearing contacts",
	// 			"Concerned about time off work",
	// 		],
	// 		personality: "Anxious but cooperative, asks relevant questions",
	// 	},
	// },
	// {
	// 	id: 2,
	// 	patientName: "Adam Jones",
	// 	age: 65,
	// 	gender: "male",
	// 	clinicType: "Glaucoma Clinic (New Patient)",
	// 	scenario:
	// 		"Explain to the patient the findings and initial management plan going forward",
	// 	task: "Explain to the patient the findings and initial management plan going forward",
	// 	triageNote: "Routine optician referral - high eye pressures detected",
	// 	agentId: "agent_0501k7fhza4afxdsc4nkmqhgz7cv",
	// 	keyFindings: {
	// 		VA: "R 6/9, L 6/9",
	// 		IOP: "R 28 mmHg, L 26 mmHg",
	// 		Gonioscopy: "Open angles bilaterally",
	// 		"Optic disc": [
	// 			"R: C/D ratio 0.7, inferior notching",
	// 			"L: C/D ratio 0.6, diffuse thinning",
	// 		],
	// 		"Visual fields": "Early superior arcuate defect right eye",
	// 		OCT: "RNFL thinning inferior quadrant right eye",
	// 	},
	// 	patientProfile: {
	// 		background:
	// 			"Retired engineer, referred by optician after routine eye test showed elevated pressures",
	// 		symptomDetails: [
	// 			"No symptoms noticed",
	// 			"Regular optician visits",
	// 			"Family history: father had glaucoma",
	// 		],
	// 		concerns: [
	// 			"Father went blind from glaucoma",
	// 			"Worried about going blind",
	// 			"Concerned about treatment side effects",
	// 		],
	// 		expectations: [
	// 			"Wants to preserve vision",
	// 			"Needs clear explanation",
	// 			"Concerned about eye drops affecting other health conditions",
	// 		],
	// 		personality: "Methodical, likes detailed explanations, slightly worried",
	// 	},
	// },
	// {
	// 	id: 3,
	// 	patientName: "Mary Davies",
	// 	age: 70,
	// 	gender: "female",
	// 	clinicType: "Medical Retina Clinic",
	// 	scenario: "Explain the findings and outline the management plan",
	// 	task: "Explain the findings and outline the management plan",
	// 	triageNote: "Follow-up for wet AMD - currently on anti-VEGF injections",
	// 	agentId: "agent_2301k7h3fq7vfjfa1xcscjeykx93",
	// 	keyFindings: {
	// 		VA: "R 6/60, L 6/12",
	// 		"Amsler grid": "Central distortion right eye",
	// 		"Fundoscopy (R)":
	// 			"Subretinal fluid, intraretinal cysts, small hemorrhages",
	// 		"OCT (R)":
	// 			"Central macular thickness 420μm, subretinal and intraretinal fluid",
	// 		"Previous treatment": "3 monthly ranibizumab injections",
	// 	},
	// 	patientProfile: {
	// 		background: "Widowed, lives alone, diagnosed with wet AMD 4 months ago",
	// 		symptomDetails: [
	// 			"Central vision distorted in right eye",
	// 			"Difficulty reading",
	// 			"Can't see faces clearly",
	// 			"Left eye compensating well",
	// 		],
	// 		concerns: [
	// 			"Will she go completely blind?",
	// 			"How long will injections continue?",
	// 			"Worried about being a burden to family",
	// 			"Anxious about injections",
	// 		],
	// 		expectations: [
	// 			"Wants to maintain independence",
	// 			"Hopes vision will improve",
	// 			"Needs reassurance about prognosis",
	// 		],
	// 		personality:
	// 			"Stoic but anxious, appreciates empathy and clear communication",
	// 	},
	// },
	{
		id: 4,
		agentId: "agent_7101k8gjjb4be9samwm3bew42ccr",
		vignette: {
			background: {
				patientName: "Brian Evans",
				age: 48,
				gender: "male",
				clinicType: "Clinic (General Opthalmology)",
				referralSource: "Consultant follow-up",
				scenario: "TBC",
			},
			task: "Take a focused history, explain the likely diagnosis, provide an initial management plan, and address the patient's concerns",
			triageNote:
				"48M follow-up for persistent right upper lid lump. Seen by a consultant 2 months ago. Still present, the patient wants removal.",
			keyFindings: {
				VA: "R 6/6, L 6/6",
				externalEye:
					"R: 10mm firm, non-tender, non-erythematous subcutaneous nodule in the mid-upper lid, away from the lid margin. No madarosis, no ulceration, or telangiectasia. L: Unremarkable.",
			},
		},
		history: {
			PC: "This persistent, ugly lump on my right upper eyelid.",
			HPC: {
				summary:
					"A painless lump on his right upper eyelid that's been there for 5 weeks and hasn't shrunk at all, despite seeing a consultant here 2 weeks ago.",
				onset_course: "Chronic.",
				duration: "About 5 weeks in total now.",
				laterality: "Right (upper lid).",
				quality_modifiers:
					"It's just a lump. It's not painful. It's not red or hot. It just sits there. It feels a bit hard.",
				associated_symptoms:
					"No discharge, no watering. Sometimes it feels a bit 'gritty' in that eye in the mornings.",
				negatives:
					"No change in vision, no distortion, no pain, no bleeding, no crusting, no loss of eyelashes.",
				triggers_exposures:
					"Works as an accountant. No trauma, no recent illness.",
				visual_function:
					"It doesn't affect my sight, but it looks dreadful. People at work keep asking me if I've been in a fight or if I'm tired. It's embarrassing.",
				timeline:
					"Noticed it 5 weeks ago. Went to my GP. Got referred here. Saw the senior doctor, the consultant, about 2 weeks ago. Given a cream to put on the eyelid, and now I'm back and it's exactly the same. No change at all.",
			},
			PMH: {
				conditions: [
					"Blepharitis (diagnosed by the consultant 2 weeks ago)",
					"Hypertension (well-controlled)",
				],
			},
			DHX: {
				medications: "Ramipril 5mg once daily.",
				allergies: "NKDA (No Known Drug Allergies).",
			},
			SHX: {
				living_situation: "Lives with his wife.",
				occupation: "Accountant.",
				smoking_alcohol:
					"Non-smoker, drinks 1-2 glasses of wine at the weekend.",
				driving_status: "Drives, no issues.",
				support: "Wife is supportive.",
			},
			FHX: {
				details: "My father has glaucoma, he uses drops.",
			},
			ICE: {
				ideas:
					"The consultant said it was a 'stye', a blocked gland. But I'm not so sure anymore.",
				concerns:
					"My main worry is that it's something serious, like cancer. Why else would it just sit there and not go away? And I'm worried it'll need a huge operation to cut it out.",
				expectations:
					"Honestly? I just want it gone. I thought I'd come in today and you'd just cut it out and be done with it.",
			},
			reaction: {
				trigger:
					"The patient has been non-adherent to the conservative management (warm compresses) advised by the consultant. He will not volunteer this. He will only reveal it if asked specifically how he is getting on with the compresses (e.g., 'Tell me exactly what you've been doing? How often? For how long?').",
				reaction_to_probe:
					"When probed, he will become defensive: 'Look, I'm a busy man. I tried that hot flannel thing for a few days, but it's messy, it gets cold in 30 seconds, and it's impossible to do it twice a day for 10 minutes. It wasn't working anyway, so I stopped after about a week. I thought it would just go away on its own.'",
				if_denied_surgery:
					"If the doctor explains that surgery isn't the first option because he hasn't tried the compresses, he will be frustrated: 'So that's it? You're saying I have to live with this embarrassing lump just because I can't sit around with a wet cloth on my face all day? I just want the operation!'",
			},
		},
		modelAnswer: {
			diagnosis: {
				likelyDiagnosis:
					"Conversion from dry to wet (neovascular) Age-Related Macular Degeneration (AMD) in the right eye.",
				rationale:
					'Sudden onset of metamorphopsia ("wavy lines") and a central scotoma, with OCT findings of subretinal fluid is classic.',
				differentials: [
					{
						condition:
							"Vitreomacular Traction (VMT) / Epiretinal Membrane (ERM) / Macular Hole",
						reasoning:
							"Can also cause metamorphopsia. Discriminated by fundus findings; OCT would confirm. Clinically, no haemorrhage is seen.",
					},
					{
						condition: "Central Serous Retinopathy (CSR)",
						reasoning:
							"Causes fluid, but typically affects younger patients and is not associated with drusen/haemorrhage.",
					},
					{
						condition: "Retinal Vein Occlusion (BRVO/CRVO)",
						reasoning:
							'Sudden painless vision loss, but fundus typically shows widespread "flame" haemorrhages/cotton wool spots, not isolated macular fluid.',
					},
				],
			},
			focusedAssessment: {
				historyQuestions: [
					"Do straight lines (like a door frame) appear wavy or distorted?",
					"Is there a blank or grey patch in the centre of your vision?",
					"Did you see any flashing lights or a 'curtain' coming across?",
					"Have you had any headaches, scalp tenderness, or pain when chewing?",
					"What kind of work do you do? How is this affecting your daily life and job?",
				],
				examinationInterpretation: {
					vaRight: "VA (R 6/36): Confirms significant, central vision loss.",
					vaLeft: "VA (L 6/9): Represents his baseline dry AMD.",
					fundusRight:
						"Subretinal fluid and haemorrhage at the macula point towards wet AMD.",
					fundusLeft: "Presence of drusen confirms underlying bilateral AMD.",
				},
			},
			immediateManagement: {
				explainDiagnosis:
					"As you suspected, it seems the dry AMD has changed. A small, new blood vessel has grown and is leaking fluid and a little blood under the centre of your vision, which is causing the distortion.",
				urgentEscalation: [
					"Discuss with the senior ophthalmologist or retinal fellow on call.",
					"Arrange urgent OCTA or FFA of the macula today to confirm and guide treatment.",
				],
				initiateTreatmentPathway: {
					summary: "Plan for intravitreal anti-VEGF injection.",
					mechanismExplanation:
						"Blocks VEGF, the molecule driving leakage; aims to dry fluid and stabilise/improve vision.",
					procedureExplanation:
						"Anaesthetic drops (no pain), cleaning the eye, then a tiny, quick injection.",
					needlePhobiaReassurance:
						"Reassure regarding brief duration and minimal discomfort.",
				},
				consent: {
					approach: "Obtain verbal consent for likely injection.",
					commonRisks: [
						"Infection (endophthalmitis)",
						"Bleed",
						"Transient pressure rise",
					],
				},
				timing:
					"Give today or within 24–48 hours per the local fast-track wet AMD pathway.",
				safetyNet: [
					"If you develop severe pain, increasing redness, or a significant drop in vision after the injection, return to Eye Casualty immediately (day or night) as this could indicate infection.",
				],
				patientLeaflet: "Provide a post-injection information leaflet.",
			},
			auxiliarySupport: {
				dvlaAdvice:
					"Stop driving immediately and inform the DVLA; clinician has a duty to advise.",
				supportActions: [
					"Provide written information (e.g., Macular Society leaflets).",
					"Check that his wife can take him home and provide support.",
				],
			},
		},
	},
];

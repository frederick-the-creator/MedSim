import { MedicalCase } from "./schemas/case";

export const medicalCases: MedicalCase[] = [
	{
		id: 1,
		agentId: "agent_8101k8nzsp40fksa7qwnpvnshd1x",
		vignette: {
			background: {
				patientName: "Mrs. Janet Davies",
				age: 68,
				gender: "Female",
				clinicType: "Eye casualty clinic",
				referralSource: "Self",
				scenario: "TBC",
			},
			task: "Take a focused history, explain the likely diagnosis, provide an initial management plan, and address the patient's concerns.",
			triageNote:
				"68F self-presenting with 2-day history of painful, blurry left eye and vomiting.",
			keyFindings: {
				VA: "R 6/9, L PL (Perception of Light)",
				Pupils: "R PEARL. L fixed, mid-dilated (5mm), positive RAPD.",
				"Anterior segment/AC":
					"R quiet, shallow AC. L ciliary flush, hazy/steamy cornea, very shallow AC.",
				"IOP/Fundus":
					"R 18 mmHg. L 62 mmHg. L fundus poor view. R disc crowded.",
			},
		},

		history: {
			PC: "A very painful, red left eye and blurred vision for two days, with headache and vomiting.",
			HPC: {
				summary:
					"A sudden, severe pain started in her left eye two days ago, like a deep ache, which spread to her forehead. Her vision went cloudy and now she can hardly see anything.",
				onset_course: "Sudden onset, progressively worsening.",
				duration:
					"It started about 48 hours ago, maybe the day before yesterday in the evening.",
				laterality: "Left eye only.",
				quality_modifiers:
					'Dreadful, deep, aching pain. "Steamy" or "cloudy" vision. Very light sensitive.',
				associated_symptoms:
					"Nausea and vomiting (3–4 times), halos around lights, headache over the left brow, watery eye.",
				negatives:
					"No sticky discharge, no floaters/flashes, no trauma, no contact with anyone with a red eye, no previous history.",
				triggers_exposures: "It started while at the cinema, in the dark.",
				visual_function:
					"I can't see my hand in front of my face with it. I'm terrified.",
				timeline:
					"Started 48h ago at cinema. Got worse overnight. Started vomiting yesterday. Tried paracetamol, didn’t help. Felt too ill to come yesterday. Son brought her today.",
			},
			PMH: {
				conditions: ["Hypertension", "Hyperopia ('long-sighted')"],
			},
			DHX: {
				medications: ["Ramipril 5mg OD", "Amlodipine 5mg OD"],
				allergies: "NKDA",
				steroid_history: "None",
			},
			SHX: {
				living_situation: "Lives alone in a bungalow.",
				occupation: "Retired school administrator.",
				smoking_alcohol: "Smokes 5 cigarettes/day. Doesn’t drink alcohol.",
				driving_status: "Drives and relies on her car.",
				support: "Son lives 20 mins away and is in the waiting room.",
				hobbies:
					"Plays tennis twice a week in Chelsea; enjoys reading gardening books.",
			},
			FHX: {
				details: [
					"Mother had glaucoma ('pressure in her eyes') and lost sight.",
					"Dad died from heart attack at 60.",
					"Son has ADHD.",
				],
			},
			ICE: {
				ideas: "I thought it was a terrible migraine, or maybe a stroke?",
				concerns:
					"I'm going to go blind. I can barely see my hand in front of my face with that eye.",
				expectations:
					"I need something for this pain, doctor. And I need to know if my sight will come back.",
			},
			reaction: {
				trigger:
					"The patient becomes tearful if told her vision might be permanently lost.",
				reaction_to_probe:
					'"So… that’s it? It’s not coming back? What about my other eye? Will this happen to my good eye?"',
				if_denied_surgery:
					"Expresses fears about losing independence and ability to drive or cope alone.",
			},
		},

		modelAnswer: {
			diagnosis: {
				likelyDiagnosis: "Acute Angle Closure Glaucoma (AACG) - Left eye.",
				rationale:
					"48-hour history of severe pain, nausea/vomiting, halos, fixed mid-dilated pupil, corneal haze, and IOP 62 mmHg are classic signs. PL vision suggests optic nerve ischaemia from delay.",
				differentials: [
					{
						condition: "Uveitic Glaucoma (e.g., Herpetic)",
						reasoning:
							"Can present with pain and high IOP but pupil is miotic/irregular with KPs, not fixed mid-dilated.",
					},
					{
						condition: "Migraine",
						reasoning:
							"Can cause headache and vomiting but not fixed pupil, corneal haze, or high IOP.",
					},
				],
			},
			focusedAssessment: {
				historyQuestions: [
					"Confirm onset and duration.",
					"Ask about nausea/vomiting.",
					"Ask about halos around lights.",
					"Ask about triggers (e.g., dim lighting).",
					"Ask about previous episodes.",
					"Ask about glasses prescription (hyperopia).",
					"Confirm family history of glaucoma.",
				],
				examinationInterpretation: {
					"VA (L PL)":
						"Indicates severe optic nerve damage from corneal oedema and delay in presentation.",
					"Pupils (L fixed, mid-dilated, RAPD)":
						"Pathognomonic — ischaemic iris sphincter, optic nerve dysfunction.",
					"Ant Seg (Hazy cornea, shallow AC)":
						"Corneal haze from epithelial oedema; shallow AC is anatomical risk factor.",
					"IOP (L 62 mmHg)":
						"Confirms sight-threatening ocular hypertension requiring urgent management.",
				},
			},
			immediateManagement: {
				explainDiagnosis:
					"This is a build-up of pressure in the eye, requiring emergency treatment to relieve it and protect your other eye.",
				urgentEscalation: [
					"Inform senior ophthalmologist/registrar on call immediately.",
				],
				medications: [
					{
						route: "PO or IV",
						name: "Acetazolamide",
						dose: "500 mg stat",
						notes: "IV if vomiting.",
					},
					{
						route: "Topical",
						name: "Timolol",
						notes: "Pressure-lowering beta-blocker.",
					},
					{
						route: "Topical",
						name: "Brimonidine",
						notes: "Alpha agonist to reduce aqueous production.",
					},
					{
						route: "Topical",
						name: "Prednisolone",
						notes: "Steroid to reduce inflammation.",
					},
				],
				procedures: [
					{
						name: "Laser Peripheral Iridotomy (LPI)",
						side: "Left eye (definitive), Right eye (prophylactic)",
						timing: "After IOP control and corneal clarity restored.",
					},
				],
				admissionRequired: true,
				consent: {
					approach:
						"Explain emergency nature, possible poor visual prognosis for L eye, need to protect R eye.",
					commonRisks: [
						"Residual vision loss",
						"Recurrent closure",
						"Need for long-term drops",
					],
				},
				timing: "Immediate admission for urgent pressure control and LPI.",
				safetyNet: [
					"Admit patient.",
					"Explain prognosis for L eye is poor due to delay.",
					"Stress importance of treatment to save R eye vision.",
				],
				patientLeaflet:
					"Acute Angle Closure Glaucoma – patient information leaflet.",
				referrals: [
					"ECLO (Eye Clinic Liaison Officer)",
					"DVLA notification (no longer meets driving standard)",
					"GP for hypertension and medication review",
				],
			},
			auxiliarySupport: {
				dvlaAdvice:
					"Advise patient not to drive and to inform DVLA as she does not meet vision standards (monocular).",
				supportActions: [
					"Refer to ECLO for emotional and practical support.",
					"Involve son with consent for discharge planning.",
				],
			},
		},
	},
	{
		id: 2,
		agentId: "agent_0501k8nyyez9f7gb59j6yvynhg0c",
		vignette: {
			background: {
				patientName: "Mr. Ramesh Sharma",
				age: 74,
				gender: "Male",
				clinicType: "Eye Casualty",
				referralSource: "Optometrist",
				scenario: "TBC",
			},
			task: "Take a focused history, explain the likely diagnosis, provide an initial management plan, and address the patient's concerns.",
			triageNote:
				"74M with known dry AMD, referred urgently by optician due to sudden distortion in the right eye vision.",
			keyFindings: {
				"Visual Acuity": "R 6/36, L 6/9 (pinhole no improvement R)",
				Pupils: "PEARL, no RAPD",
				"Anterior Segment/AC": "R&L Deep and quiet",
				IOP: "R 16, L 15 mmHg",
				OCT: [
					"(R): Large subretinal fluid and haemorrhage in the macula.",
					"(L): Extensive soft drusen, pigmentary changes.",
				],
			},
		},
		history: {
			PC: "Sudden distorted, blurry vision in my right eye.",
			HPC: {
				summary:
					"Woke up yesterday morning and noticed the tiles on the bathroom wall looked 'bent' or 'wavy' with his right eye.",
				onset_course:
					"Noticed it yesterday (24 hours ago), but it seems much worse this morning.",
				duration: "About 24-36 hours.",
				laterality: "Right eye only. Left eye seems normal for him.",
				quality_modifiers:
					"Metamorphopsia ('wavy,' 'distorted,' 'bent lines') with a central grey patch (scotoma).",
				associated_symptoms: "Central blurring.",
				negatives:
					"No pain, no redness, no discharge. No flashes or floaters. No headache, no jaw pain, no scalp tenderness.",
				triggers_exposures: "No trauma. No new medications.",
				visual_function:
					"It's impossible. I can't read the newspaper. I work part-time in the hospital's pathology lab, looking at slides under a microscope. I went in this morning and I couldn't focus on the samples. I'm terrified I'll make a mistake.",
				timeline:
					"Noticed bathroom tiles looked 'wavy' yesterday morning. Thought he was just tired. This morning, covered his left eye and realised the centre of his vision was a 'grey, wobbly mess.' Went straight to his optician, who looked at his eye and sent him here immediately.",
			},
			PMH: {
				conditions: [
					"Dry AMD (diagnosed 5 years ago)",
					"Hypertension (well-controlled)",
				],
			},
			DHX: {
				medications: [
					"Amlodipine 5mg once daily",
					"AREDS2 vitamins (PreserVision)",
				],
				allergies: "NKDA (No Known Drug Allergies)",
				steroid_history: "None",
			},
			SHX: {
				living_situation: "Lives with his wife, who is 72 and generally well.",
				occupation:
					"Works 3 days/week as a pathology lab technician (needs good vision for microscope work).",
				driving_status:
					"Drives, but 'didn't dare drive today, my wife brought me.' Very worried about this.",
				smoking_alcohol: "Non-smoker, occasional glass of wine.",
				support: "Wife is here.",
			},
			FHX: {
				details: [],
			},
			ICE: {
				ideas:
					"I know I have the 'dry' type of macular degeneration. I'm guessing this has turned into the 'wet' type my optician warned me about?",
				concerns:
					"Am I going blind? Will I lose my job? I need my eyes for my work. And what about my driving licence?",
				expectations:
					"The optician said you might have an injection for this... in the eye? I'm terrified of needles, but I'll do anything if it saves my sight.",
			},
			reaction:
				"When the doctor confirms the diagnosis and discusses management, the patient will become very anxious about his work. 'But the injection... will it work? How quickly? I have to be able to use the microscope. If I can't do my job, they'll make me retire. It's my whole life, doctor.' When driving is mentioned, he will say: 'Oh god, my licence. If I can't drive, how will I even get to the lab? Or to all these hospital appointments?'",
		},
		modelAnswer: {
			diagnosis: {
				likelyDiagnosis:
					"Conversion from dry to wet (neovascular) Age-Related Macular Degeneration (AMD) in the right eye.",
				rationale:
					"The sudden onset of metamorphopsia and a central scotoma, with OCT findings of subretinal fluid and haemorrhage, is classic for wet AMD.",
				differentials: [
					{
						condition:
							"Vitreomacular Traction (VMT) / Epiretinal Membrane (ERM) / Macular Hole",
						reasoning:
							"Can cause metamorphopsia but not associated with subretinal haemorrhage.",
					},
					{
						condition: "Central Serous Retinopathy (CSR)",
						reasoning:
							"Causes macular fluid but typically in younger patients without drusen or haemorrhage.",
					},
					{
						condition: "Retinal Vein Occlusion (BRVO/CRVO)",
						reasoning:
							"Sudden painless vision loss with widespread flame haemorrhages or cotton wool spots, unlike this focal macular finding.",
					},
				],
			},
			focusedAssessment: {
				historyQuestions: [
					"Are straight lines (like a door frame) appearing wavy or distorted?",
					"Is there a blank or grey patch in the centre of your vision?",
					"Did you see any flashing lights or a 'curtain' coming across?",
					"Have you had any headaches, scalp tenderness, or pain when chewing?",
					"What kind of work do you do? How is this affecting your daily life and job?",
				],
				examinationInterpretation: {
					"VA (R 6/36)": "Confirms significant central vision loss.",
					"VA (L 6/9)": "Represents baseline dry AMD vision.",
					"Fundus (R)":
						"Subretinal fluid and haemorrhage at the macula indicate wet AMD.",
					"Fundus (L)":
						"Presence of drusen consistent with underlying bilateral AMD.",
				},
			},
			immediateManagement: {
				explainDiagnosis:
					"As you suspected, it seems the dry AMD has changed. A small, new blood vessel has grown and is leaking fluid and a little blood under the centre of your vision, which is causing the distortion.",
				urgentEscalation: [
					"Discuss with the senior ophthalmologist or retinal fellow on call.",
					"Arrange for an urgent OCTA or FFA scan of the macula today to confirm the fluid and guide treatment.",
				],
				medications: [
					{
						route: "Intravitreal",
						name: "Anti-VEGF injection",
						notes:
							"Blocks VEGF to stop leakage, aiming to dry the macula and stabilise vision.",
					},
				],
				consent: {
					approach: "Verbal consent for likely injection.",
					commonRisks: [
						"Infection (endophthalmitis)",
						"Bleeding",
						"Pressure rise",
					],
				},
				timing:
					"Injection to be given today or within 24–48 hours per fast-track wet AMD pathway.",
				safetyNet: [
					"After any injection, if severe pain, increasing redness, or drop in vision occurs, return to Eye Casualty immediately.",
				],
				patientLeaflet: "Post-injection leaflet for wet AMD.",
				referrals: ["DVLA", "Macular Society", "GP (for shared care updates)"],
			},
			auxiliarySupport: {
				dvlaAdvice: "Must stop driving immediately and inform the DVLA.",
				supportActions: [
					"Provide Macular Society leaflet.",
					"Confirm his wife can assist with transport and appointments.",
				],
			},
		},
	},
	{
		id: 3,
		agentId: "agent_5801k8nz924zfz2apmd2a4smeses",
		vignette: {
			background: {
				patientName: "Obi Eze",
				age: 32,
				gender: "Female",
				clinicType: "Eye Casualty",
				referralSource: "Self (follow-up)",
				scenario: "TBC",
			},
			task: "Take a focused history, explain the likely diagnosis, provide an initial management plan, and address the patient’s concerns.",
			triageNote:
				'32F review, seen 2 days ago for "sticky right eye". Not improving on Chloramphenicol drops. Swab results today are positive for Chlamydia trachomatis.',
			keyFindings: {
				VA: ["R 6/9 (improves with blink)", "L 6/6"],
				Pupils: "R/L PEARL. No RAPD.",
				AnteriorSegment:
					"R: Moderate conjunctival injection, mucopurulent discharge, large follicles on lower tarsal conjunctiva, mild punctate epithelial erosions. L: Quiet.",
				IOP: "R 14 mmHg, L 15 mmHg.",
				Fundus: "Clear views, normal disc/macula.",
			},
		},

		history: {
			PC: '"Sticky, red right eye that isn’t getting better."',
			HPC: {
				summary:
					"A persistent sticky, red right eye for about a week, which has not responded to 2 days of antibiotic drops.",
				onset_course:
					"Started gradually about 7 days ago. Came to Eye Casualty 2 days ago.",
				duration: "7 days",
				laterality: "Right eye only",
				quality_modifiers:
					"Gritty feeling, slightly blurry vision clearing with blink, mildly photophobic, no significant pain.",
				associated_symptoms:
					"Yellowish-white sticky discharge, especially on waking.",
				negatives:
					"No severe pain, no vision loss (just blurring from discharge), no flashes or floaters. Left eye fine.",
				triggers_exposures:
					"No contact lens wear, no trauma, no sick contacts. (Do not volunteer sexual history.)",
				visual_function:
					"Annoying and blurs reading; has avoided driving due to discomfort.",
				timeline:
					"Right eye red for 7 days. Came 2 days ago, started Chloramphenicol drops QDS, no improvement.",
			},
			PMH: {
				conditions: ["Generally fit and well."],
			},
			DHX: {
				medications: [
					"Chloramphenicol 0.5% drops (R eye) QDS (started 2 days ago)",
					"Microgynon (combined oral contraceptive pill)",
				],
				allergies: "NKDA",
			},
			SHX: {
				living_situation: "Lives with husband. Married 5 years, together 8.",
				occupation: "Primary school teacher",
				smoking_alcohol:
					"Smokes 5/day. Drinks 1–2 glasses of wine on weekends.",
				driving_status: "Currently avoiding driving due to discomfort.",
			},
			FHX: {
				details: ["None relevant."],
			},
			ICE: {
				ideas: "Maybe it’s an allergy if antibiotics aren’t working.",
				concerns:
					"Worried it’s something serious and about infecting children at school.",
				expectations: "Wants stronger drops that will clear the infection.",
			},
			reaction: {
				trigger:
					"Doctor mentions the swab shows Chlamydia infection in the eye.",
				reaction_to_probe:
					"Initial disbelief: “That’s impossible — I’ve only ever been with my husband.” Then anger/distress: “Are you saying my husband’s cheated on me? This is just an eye infection!”",
				if_denied_surgery:
					"Core concern becomes fear of infidelity and confidentiality: 'Who else knows? Will my GP or husband be told?'",
			},
		},

		modelAnswer: {
			diagnosis: {
				likelyDiagnosis: "Adult Chlamydial Conjunctivitis",
				rationale:
					"Unilateral, follicular conjunctivitis not responding to Chloramphenicol with positive swab for Chlamydia trachomatis.",
				differentials: [
					{
						condition: "Adenoviral Conjunctivitis",
						reasoning:
							"Watery discharge, often bilateral or sequential, typically self-limiting.",
					},
					{
						condition: "Simple Bacterial Conjunctivitis",
						reasoning:
							"Would usually improve within 48h of Chloramphenicol; follicles not typical.",
					},
					{
						condition: "Allergic Conjunctivitis",
						reasoning:
							"Bilateral, itchy, papillae not follicles, no mucopurulent discharge.",
					},
				],
			},

			focusedAssessment: {
				historyQuestions: [
					"Confirm compliance with Chloramphenicol drops.",
					"Clarify discharge, pain, vision changes.",
					"Ask about contact lens use, trauma, or exposure.",
					"Ask about urinary discomfort or genital discharge.",
					"Take a sensitive sexual history.",
					"Ask about partner’s symptoms.",
				],
				examinationInterpretation: {
					unilateral:
						"Classic for early chlamydial conjunctivitis, can become bilateral later.",
					follicles:
						"Large follicles on lower tarsal conjunctiva are key clue distinguishing from bacterial.",
					non_response:
						"Non-response to Chloramphenicol indicates intracellular organism (Chlamydia).",
					corneal_findings:
						"Punctate epithelial erosions explain gritty feeling and mild visual blur.",
				},
			},

			immediateManagement: {
				explainDiagnosis:
					"Explain that swab shows Chlamydia infection, a bacteria requiring systemic treatment.",
				medications: [
					{
						route: "Oral",
						name: "Azithromycin",
						dose: "1 g stat dose",
						notes: "Alternative: Doxycycline 100 mg BD for 7 days.",
					},
				],
				referrals: [
					"GUM / Sexual Health Clinic for partner notification and full STI screen",
				],
				safetyNet: [
					"Eye should improve in a few days; return if worsening pain, vision loss, or no improvement within a week.",
					"Emphasize good hygiene to avoid spread to other eye.",
				],
			},

			auxiliarySupport: {
				supportActions: [
					"Offer privacy, tissues, and reassurance.",
					"Reassure confidentiality — only GP and GUM clinic notified.",
					"Provide patient information leaflets on Chlamydial Conjunctivitis and local sexual health services.",
					"Reassure safe to return to teaching when comfortable (not spread by casual contact).",
				],
			},
		},
	},
	{
		id: 4,
		agentId: "ophth-llm-v1",
		vignette: {
			background: {
				patientName: "Mr. Jonathan Clark",
				age: 65,
				gender: "Male",
				clinicType: "Clinic (eye casualty)",
				referralSource: "GP",
				scenario: "TBC",
			},
			task: "Take a focused history, explain the likely diagnosis, provide an initial management plan, and address the patient's concerns.",
			triageNote:
				"65M referred by GP with sudden R vision loss and R-sided headache. Query optic neuritis?",
			keyFindings: {
				VA: ["R: Counting Fingers", "L: 6/6"],
				Pupils: "R: Large RAPD; L: No RAPD",
				"Anterior segment/AC": "R&L: Deep and quiet",
				IOP: "R 14, L 15",
				Fundus: "R: Pale, swollen optic disc; L: Normal disc",
			},
		},

		history: {
			PC: "Loss of vision in the right eye and a terrible headache.",
			HPC: {
				summary:
					"A few days of feeling unwell and a headache, now woken with sudden, severe right-eye sight loss.",
				onset_course:
					"Vision loss was sudden on waking today (~4 hours ago). Headache subacute over 4–5 days.",
				duration: "Vision loss <1 day; headache ~5 days.",
				laterality: "Right eye vision loss; right-sided temporal headache.",
				quality_modifiers:
					'Headache is "burning, throbbing." Scalp is extremely tender to touch/pressure.',
				associated_symptoms:
					"Jaw claudication on chewing; constitutional malaise; proximal shoulder aching (PMR symptoms).",
				negatives:
					"No flashes or floaters; no discharge; no diplopia; no trauma; no rash.",
				triggers_exposures: "None identified.",
				visual_function: "Cannot read or see TV with the right eye.",
				timeline:
					"1 week ago: flu-like symptoms and shoulder/hip stiffness. 5 days ago: right temporal headache began. Today: sudden right-eye vision loss; sent to Eye Casualty by GP.",
			},
			PMH: {
				conditions: [
					"Hypertension (well-controlled)",
					"Type 2 Diabetes (diet-controlled)",
				],
			},
			DHX: {
				medications: ["Amlodipine 5 mg OD", "Metformin 500 mg BD"],
				allergies: "NKDA",
				steroid_history: "None",
			},
			SHX: {
				living_situation: "Lives with wife, Sarah.",
				occupation: "Retired builder.",
				driving_status:
					"Normally drives; has not driven for 2 days due to headache.",
				support: "Wife present and anxious.",
			},
			FHX: {
				details: ["Father had a stroke", "Mother had glaucoma"],
			},
			ICE: {
				ideas: "Worried it might be a 'stroke in the eye.'",
				concerns:
					"Fear of permanent blindness in the right eye and that the other eye may be affected.",
				expectations: "Pain relief and treatment to save his sight.",
			},
			reaction:
				"Clearly in pain and anxious; becomes distressed when told condition is inflammatory and can affect the other eye; worried about steroid side effects (esp. with diabetes) and anxious about temporal artery biopsy.",
		},

		modelAnswer: {
			diagnosis: {
				likelyDiagnosis:
					"Giant Cell Arteritis (GCA) causing arteritic anterior ischaemic optic neuropathy (A-AION) of the right eye — ophthalmic emergency.",
				rationale:
					"Age >50, new temporal headache with scalp tenderness, jaw claudication, systemic PMR-like symptoms, severe unilateral optic neuropathy with RAPD and pale swollen disc.",
				differentials: [
					{
						condition: "Non-arteritic AION (NA-AION)",
						reasoning:
							"Fits vascular risks (HTN, T2DM) but lacks systemic GCA features; disc classically hyperaemic rather than pale.",
					},
					{
						condition: "Optic neuritis",
						reasoning:
							"Usually younger (20s–40s), subacute pain with eye movements; not typically with jaw claudication/PMR symptoms.",
					},
					{
						condition: "Central retinal artery occlusion (CRAO)",
						reasoning:
							"Profound painless loss with cherry-red spot; here disc swelling/pallor suggests A-AION instead.",
					},
				],
			},

			focusedAssessment: {
				historyQuestions: [
					"Is your scalp sore to touch or when brushing hair?",
					"Do you get pain or tiredness in the jaw when chewing (e.g., steak/bread)?",
					"Any morning stiffness/aching in shoulders or hips (PMR)?",
					"Any fevers, night sweats, weight loss, general malaise?",
					"Any transient vision loss previously (amaurosis fugax)?",
					"Any new limb claudication or tender, thickened temporal arteries?",
				],
				examinationInterpretation: {
					RAPD: "Large RAPD in the right eye → severe right optic neuropathy.",
					"Disc appearance":
						"Right disc pale and swollen → ‘chalky white’ swelling typical of arteritic AION.",
					VA: "Right CF indicates profound acuity loss; left 6/6 is currently preserved and at high risk.",
					IOP: "Normal (R14/L15), supporting posterior ischaemic process rather than acute glaucoma.",
					"Anterior segment":
						"Deep and quiet both eyes; no anterior inflammation to explain symptoms.",
				},
			},

			immediateManagement: {
				explainDiagnosis:
					"This is most likely GCA (an inflammation of medium/large arteries) that has reduced blood flow to the right optic nerve. Treatment is urgent to protect the left eye. Vision already lost in the right eye often does not recover, but rapid steroids greatly reduce the risk to the other eye.",
				urgentEscalation: [
					"Urgently inform on-call ophthalmology and medical/rheumatology teams.",
					"Immediate bloods: FBC (platelets), ESR, CRP; U&Es; LFTs; baseline glucose/HbA1c.",
					"Document baseline visual acuity, colour vision, and visual fields (left eye especially).",
					"Admit for IV therapy, monitoring, and expedited biopsy/vascular workup.",
				],
				medications: [
					{
						route: "IV",
						name: "Methylprednisolone",
						dose: "1 g",
						frequency: "Once daily for 3 days",
						notes: "Start immediately; do not wait for bloods.",
					},
					{
						route: "PO",
						name: "Prednisolone",
						dose: "60 mg (1 mg/kg up to 60 mg) daily",
						frequency: "Daily after IV course",
						notes:
							"Slow taper per rheumatology with ESR/CRP guidance; protect left eye while inflammation controlled.",
					},
					{
						route: "PO",
						name: "Proton pump inhibitor",
						dose: "Standard dose",
						frequency: "Daily",
						notes: "Gastric protection on high-dose steroids.",
					},
					{
						route: "PO",
						name: "Calcium/Vitamin D ± Bisphosphonate",
						dose: "Per local protocol",
						frequency: "As directed",
						notes: "Bone protection on prolonged steroids.",
					},
					{
						route: "PO/SC",
						name: "Glycaemic management plan",
						dose: "Individualised",
						frequency: "As required",
						notes:
							"Close capillary glucose monitoring; liaise with diabetes team as steroids will raise glucose.",
					},
					{
						route: "PO",
						name: "Analgesia",
						dose: "Per pain ladder",
						frequency: "As required",
						notes: "Headache relief while inflammation settles.",
					},
				],
				procedures: [
					{
						name: "Temporal artery biopsy",
						side: "Right (symptomatic side; consider bilateral if needed)",
						timing: "Within 1 week (preferably within 3–7 days)",
						notes:
							"Start steroids first; biopsy yield remains adequate after initiation for at least 1–2 weeks.",
					},
				],
				admissionRequired: true,
				consent: {
					approach:
						"Discuss emergency nature, benefits of immediate steroids to save left-eye vision, and side effects/monitoring.",
					commonRisks: [
						"Steroid side effects: hyperglycaemia, infection risk, mood changes, insomnia, dyspepsia, osteoporosis",
						"Biopsy risks: bleeding, infection, scar, facial nerve branch injury (rare)",
					],
				},
				timing:
					"Treat now to prevent fellow-eye involvement (can occur within hours–days).",
				safetyNet: [
					"Return immediately if any blurring, shadow, or vision change in the left eye.",
					"Report fever, signs of infection, or uncontrolled blood sugars while on steroids.",
					"Do not drive until cleared; vision/legal standards must be met.",
				],
				patientLeaflet:
					"Provide GCA/PMR information and steroid safety leaflet (plain language).",
				referrals: [
					"ECLO (Eye Clinic Liaison Officer) for vision support",
					"Rheumatology for GCA co-management and steroid taper",
					"Diabetes team for steroid-induced hyperglycaemia management",
					"Notify/advise DVLA and counsel on driving restrictions",
					"Inform GP for follow-up and monitoring plan",
				],
			},

			auxiliarySupport: {
				dvlaAdvice:
					"Not fit to drive currently due to profound monocular vision loss; must inform DVLA and insurer. Reassess legality after stabilisation.",
				supportActions: [
					"Involve wife (with consent) in explanations and safety-netting.",
					"Offer low-vision support for right-eye loss if persistent.",
					"Provide written plan with contact numbers for urgent review.",
				],
			},
		},
	},
	{
		id: 5,
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
				details: ["My father has glaucoma, he uses drops."],
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
				procedures: [
					{
						name: "Intravitreal anti-VEGF injection",
						timing:
							"Today or within 24–48 hours per the fast-track wet AMD pathway.",
						notes:
							"Blocks VEGF to reduce leakage and stabilise/improve vision. Procedure: anaesthetic drops, antiseptic prep, brief small-gauge injection. Reassure regarding brief duration and minimal discomfort.",
					},
				],
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

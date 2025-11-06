export interface Discipline {
	name: string;
	isPrimary: boolean;
	ctaLabel: string;
}

export const disciplines: Discipline[] = [
	{ name: "Internal Medicine Training", isPrimary: false, ctaLabel: "Register interest" },
	{ name: "Core Surgical Training", isPrimary: false, ctaLabel: "Register interest" },
	{ name: "Anaesthetics CT1 / ACCS", isPrimary: false, ctaLabel: "Register interest" },
	{ name: "Cardiothoracic Surgery ST1", isPrimary: false, ctaLabel: "Register interest" },
	{ name: "CSRH ST1", isPrimary: false, ctaLabel: "Register interest" },
	{ name: "Emergency Medicine ACCS", isPrimary: false, ctaLabel: "Register interest" },
	{ name: "GP Selection Centre", isPrimary: false, ctaLabel: "Register interest" },
	{ name: "Histopathology ST1", isPrimary: false, ctaLabel: "Register interest" },
	{ name: "Neurosurgery ST1", isPrimary: false, ctaLabel: "Register interest" },
	{ name: "Obs and Gynae ST1", isPrimary: false, ctaLabel: "Register interest" },
	{ name: "Ophthalmology ST1", isPrimary: true, ctaLabel: "Sign up" },
	{ name: "Paediatrics ST1", isPrimary: false, ctaLabel: "Register interest" },
	{ name: "Public Health Medicine ST1", isPrimary: false, ctaLabel: "Register interest" },
	{ name: "Radiology ST1", isPrimary: false, ctaLabel: "Register interest" },
	{ name: "Academic Clinical Fellowship", isPrimary: false, ctaLabel: "Register interest" },
];



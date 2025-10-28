import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
	id: varchar("id")
		.primaryKey()
		.default(sql`gen_random_uuid()`),
	username: text("username").notNull().unique(),
	password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
	username: true,
	password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export interface Vignette {
	background: {
		patientName: string;
		age: number;
		gender: string;
		clinicType: string;
		referralSource: string;
		scenario: string;
	};
	task: string;
	triageNote: string;
	keyFindings: Record<string, string | string[]>;
}

export interface History {
	PC: string;
	HPC: {
		summary: string;
		onset_course: string;
		duration: string;
		laterality: string;
		quality_modifiers: string;
		associated_symptoms: string;
		negatives: string;
		triggers_exposures: string;
		visual_function: string;
		timeline: string;
	};
	PMH: {
		conditions: string[];
	};
	DHX: {
		medications: string;
		allergies: string;
	};
	SHX: {
		living_situation: string;
		occupation: string;
		smoking_alcohol: string;
		driving_status: string;
		support: string;
	};
	FHX: {
		details: string;
	};
	ICE: {
		ideas: string;
		concerns: string;
		expectations: string;
	};
	reaction: {
		trigger: string;
		reaction_to_probe: string;
		if_denied_surgery: string;
	};
}

export interface ModelAnswer {
	diagnosis: {
		likelyDiagnosis: string;
		rationale: string;
		differentials: Array<{
			condition: string;
			reasoning: string;
		}>;
	};
	focusedAssessment: {
		historyQuestions: string[];
		examinationInterpretation: {
			vaRight: string;
			vaLeft: string;
			fundusRight: string;
			fundusLeft: string;
		};
	};
	immediateManagement: {
		explainDiagnosis: string;
		urgentEscalation: string[];
		initiateTreatmentPathway: {
			summary: string;
			mechanismExplanation: string;
			procedureExplanation: string;
			needlePhobiaReassurance?: string;
		};
		consent: {
			approach: string;
			commonRisks: string[];
		};
		timing: string;
		safetyNet: string[];
		patientLeaflet?: string;
	};
	auxiliarySupport: {
		dvlaAdvice: string;
		supportActions: string[];
	};
}
// Medical case types
export interface MedicalCase {
	id: number;
	agentId: string;
	vignette: Vignette;
	history: History;
	modelAnswer: ModelAnswer;
}

export interface ChatMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
}

export interface FeedbackSection {
	category: string;
	score: number;
	maxScore: number;
	comments: string[];
	strengths: string[];
	improvements: string[];
}

export interface ConversationFeedback {
	overall: string;
	sections: FeedbackSection[];
}

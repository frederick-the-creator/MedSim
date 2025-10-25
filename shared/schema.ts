import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Medical case types
export interface MedicalCase {
  id: number;
  patientName: string;
  age: number;
  gender: string;
  clinicType: string;
  scenario: string;
  task: string;
  triageNote: string;
  keyFindings: Record<string, string | string[]>;
  patientProfile: {
    background: string;
    symptomDetails: string[];
    concerns: string[];
    expectations: string[];
    personality: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
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

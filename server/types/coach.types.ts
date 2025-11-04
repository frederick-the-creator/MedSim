import {
	Tables,
	TablesInsert,
	TablesUpdate,
} from "@server/types/database.types.js";

export type CoachRow = Tables<"assessment">;
export type CoachInsert = TablesInsert<"coach">;
// export type CoachUpdate = TablesUpdate<"coach">;

export type CoachUpsert = Omit<CoachInsert, "id" | "createdAt">; // Unique constraint on conversationId so upsert will look to that

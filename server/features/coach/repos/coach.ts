import { CoachUpsert } from "@server/types/coach.types.js";
import { createSupabaseClient } from "@server/shared/supabaseClient";

export async function upsertCoachData(fields: CoachUpsert): Promise<void> {
	const supabase = createSupabaseClient();
	const { error } = await supabase
		.from("coach")
		.upsert(fields, { onConflict: "conversationId" });

	if (error) {
		throw new Error(error.message || "Failed to create round");
	}
}

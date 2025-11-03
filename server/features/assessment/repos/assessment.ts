import { AssessmentInsert } from "@server/types/assessment.types.js";
import { createSupabaseClient } from "@server/shared/supabaseClient";

export async function insertAssessmentData(
	fields: AssessmentInsert,
): Promise<void> {
	// console.log("InsertAssessmentData");
	// console.log("fields:");
	// console.log(fields);
	const supabase = createSupabaseClient();
	const { data, error } = await supabase
		.from("assessment")
		.insert(fields)
		.select()
		.single();

	if (error) {
		console.log("[insertAssessmentData] DB error: ", error);
		throw new Error(error.message || "Failed to create round");
	}

	if (!data) {
		throw new Error("Failed to create assessment row: no data returned");
	}
}

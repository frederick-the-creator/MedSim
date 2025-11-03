import {
	Tables,
	TablesInsert,
	TablesUpdate,
} from "@server/types/database.types.js";

// export type AssessmentRow = Tables<"assessment">;
export type AssessmentInsert = TablesInsert<"assessment">;
// export type AssessmentUpdate = TablesUpdate<"assessment">;

// export type Assessment = SnakeToCamelKeys<Tables<"assessment">>;

// export type CreateAssessment = Omit<
// 	SnakeToCamelKeys<TablesInsert<"assessment">>,
// 	"id"
// >;
// export type UpdateAssessment = { roundId: string } & SnakeToCamelKeys<
// 	Omit<TablesUpdate<"assessment">, "id">
// >;
// export type DeleteAssessment = { roomId: string };

// export const AssessmentMapper = {
// 	insertToDb(insert: CreateAssessment): AssessmentInsert {
// 		const mapped = camelToSnakeObject(insert) as AssessmentInsert;
// 		return mapped;
// 	},
// updateToDb(update: UpdateAssessment): AssessmentUpdate {
// 	const { roundId, ...rest } = update;
// 	const mapped = camelToSnakeObject(rest) as AssessmentUpdate;
// 	return { id: roundId, ...mapped };
// },
// fromDb(row: AssessmentRow): Assessment {
// 	const domain = snakeToCamelObject(row) as Assessment;
// 	return domain;
// },
// };

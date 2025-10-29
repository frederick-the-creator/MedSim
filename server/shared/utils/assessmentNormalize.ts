import { Assessment, DIMENSION_KEYS } from "@shared/schemas/assessment";
import type { DimensionKey } from "@shared/schemas/assessment";
import { isAssessment } from "@server/shared/utils/validation";

type UnknownRecord = Record<string, unknown>;

const KEY_TO_CANONICAL_NAME: Record<(typeof DIMENSION_KEYS)[number], string> = {
	rapport_introduction_structure_flow:
		"Rapport, introduction, structure and flow",
	empathy_listening_patient_perspective:
		"Empathy, listening and patient perspective",
	medical_explanation_and_plan: "Medical explanation and plan",
	honesty_and_transparency: "Honesty and transparency",
	appropriate_pace: "Appropriate pace",
};

const NAME_TO_KEY: Record<string, (typeof DIMENSION_KEYS)[number]> =
	Object.entries(KEY_TO_CANONICAL_NAME).reduce(
		(acc, [k, v]) => {
			acc[v] = k as (typeof DIMENSION_KEYS)[number];
			return acc;
		},
		{} as Record<string, (typeof DIMENSION_KEYS)[number]>,
	);

function coerceString(value: unknown, fallback = ""): string {
	return typeof value === "string" ? value : fallback;
}

function coerceBoolean(value: unknown, fallback = false): boolean {
	return typeof value === "boolean" ? value : fallback;
}

function coerceStringArray(value: unknown, maxLen?: number): string[] {
	if (!Array.isArray(value)) return [];
	const arr = value.filter((x) => typeof x === "string");
	return typeof maxLen === "number" ? arr.slice(0, maxLen) : arr;
}

function normalizePoints(
	value: unknown,
): { type: "strength" | "improvement"; text: string }[] {
	if (!Array.isArray(value)) return [];
	const items = value
		.map((p) =>
			typeof p === "object" && p !== null ? (p as UnknownRecord) : null,
		)
		.filter((p): p is UnknownRecord => !!p)
		.map((p) => {
			const type =
				p.type === "strength" || p.type === "improvement" ? p.type : null;
			const text = typeof p.text === "string" ? p.text : null;
			if (!type || !text) return null;
			return { type, text } as const;
		})
		.filter((x): x is { type: "strength" | "improvement"; text: string } => !!x)
		.slice(0, 3);
	return items;
}

function emptyDimensionForKey(key: (typeof DIMENSION_KEYS)[number]) {
	return {
		name: KEY_TO_CANONICAL_NAME[key],
		points: [] as { type: "strength" | "improvement"; text: string }[],
		insufficient_evidence: false,
		red_flags: [] as string[],
	};
}

function normalizeDimension<K extends DimensionKey>(
	raw: unknown,
	key: K,
): Assessment["dimensions"][K] {
	const obj = (
		typeof raw === "object" && raw !== null ? (raw as UnknownRecord) : {}
	) as UnknownRecord;
	return {
		name: KEY_TO_CANONICAL_NAME[key],
		points: normalizePoints(obj.points),
		insufficient_evidence: coerceBoolean(obj.insufficient_evidence, false),
		red_flags: coerceStringArray(obj.red_flags),
	} as Assessment["dimensions"][K];
}

export function normalizeAssessment(raw: unknown): Assessment | null {
	// Start with a defensive parse of root object
	const root: UnknownRecord | null =
		typeof raw === "object" && raw !== null ? (raw as UnknownRecord) : null;
	if (!root) return null;

	let dimsRaw = (root as any).dimensions as unknown;

	// Accept array form and convert by mapping names → keys
	if (Array.isArray(dimsRaw)) {
		const tmp: Partial<Record<(typeof DIMENSION_KEYS)[number], UnknownRecord>> =
			{};
		for (const d of dimsRaw) {
			if (typeof d !== "object" || d === null) continue;
			const name = (d as any).name as unknown;
			if (typeof name !== "string") continue;
			const key = NAME_TO_KEY[name];
			if (!key) continue;
			tmp[key] = d as UnknownRecord;
		}
		dimsRaw = tmp as UnknownRecord;
	}

	const dimsObj: UnknownRecord =
		typeof dimsRaw === "object" && dimsRaw !== null
			? (dimsRaw as UnknownRecord)
			: {};

	const normalizedDims = {} as Assessment["dimensions"];
	for (const key of DIMENSION_KEYS) {
		(normalizedDims as any)[key] = normalizeDimension(dimsObj[key], key);
	}

	const summaryRaw = (root as any).summary as unknown;
	const summaryObj =
		typeof summaryRaw === "object" && summaryRaw !== null
			? (summaryRaw as UnknownRecord)
			: ({} as UnknownRecord);

	const normalized: Assessment = {
		dimensions: normalizedDims,
		summary: {
			free_text: coerceString(summaryObj.free_text, ""),
			bullet_points: coerceStringArray(summaryObj.bullet_points, 3),
		},
	};

	return isAssessment(normalized) ? normalized : null;
}

export default normalizeAssessment;

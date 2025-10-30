import type { CoachRequestBody } from "@shared/schemas/coach";

export function useCoach() {
	async function postCoachAndStream(
		body: CoachRequestBody,
		onUpdate: (partialText: string) => void,
	): Promise<string> {
		const resp = await fetch("/api/chat", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		if (!resp.ok || !resp.body) throw new Error(`Chat error ${resp.status}`);
		const reader = resp.body.getReader();
		const decoder = new TextDecoder();
		let acc = "";
		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			acc += decoder.decode(value, { stream: true });
			onUpdate(acc);
		}
		return acc;
	}

	return { postCoachAndStream };
}

// Centralized client configuration values

const mockEnv = (import.meta as any).env?.VITE_MOCK_VOICE_AGENT as
	| string
	| undefined;
if (mockEnv == null) {
	throw new Error(
		"VITE_MOCK_VOICE_AGENT is required. Set it to 'true' or 'false' in client/.env.local",
	);
}

export const MOCK_VOICE_AGENT: boolean = mockEnv === "true";

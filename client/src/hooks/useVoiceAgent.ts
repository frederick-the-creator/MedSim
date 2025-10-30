import { useConversation } from "@elevenlabs/react";
import { useEffect, useRef, useState } from "react";

export type AgentState = "talking" | "listening" | null;

export type VoiceAgent = {
	conversationId: string | null;
	agentState: AgentState;
	isConnected: boolean;
	isConnecting: boolean;
	getInputVolume: () => number;
	getOutputVolume: () => number;
	startConversation: (opts: {
		agentId: string;
		userId?: string;
	}) => Promise<void>;
	endConversation: () => Promise<void>;
};

export function useVoiceAgent(): VoiceAgent {
	const [conversationId, setConversationId] = useState<string | null>(null);
	const conversation = useConversation({
		onConnect: () => {
			// no-op
		},
		onDisconnect: () => {
			// no-op
		},
		onMessage: () => {
			// no-op
		},
		onError: () => {
			// no-op
		},
	});

	const startConversation = async (opts: {
		agentId: string;
		userId?: string;
	}) => {
		try {
			const id = await conversation.startSession({
				agentId: opts.agentId,
				connectionType: "websocket",
				userId: opts.userId ?? "fixed-user-12345",
				clientTools: {},
			});
			setConversationId(id);
		} catch (error) {
			// Surface in console; caller can also observe via connection flags
			console.error("Failed to start conversation:", error);
		}
	};

	const endConversation = async () => {
		try {
			await conversation.endSession();
		} catch (error) {
			console.error("Error ending session:", error);
		}
		setConversationId(null);
	};

	useEffect(() => {
		return () => {
			if (conversation.status === "connected") {
				conversation.endSession().catch(() => {});
			}
		};
	}, []);

	const isConnected = conversation.status === "connected";
	const isConnecting = conversation.status === "connecting";

	const agentState: AgentState = !isConnected
		? null
		: conversation.isSpeaking
			? "talking"
			: "listening";

	const getInputVolume = () => {
		const raw = conversation.getInputVolume?.() ?? 0;
		return Math.min(1.0, Math.pow(raw, 0.5) * 2.5);
	};

	const getOutputVolume = () => {
		const raw = conversation.getOutputVolume?.() ?? 0;
		return Math.min(1.0, Math.pow(raw, 0.5) * 2.5);
	};

	return {
		conversationId,
		agentState,
		isConnected,
		isConnecting,
		getInputVolume,
		getOutputVolume,
		startConversation,
		endConversation,
	};
}

export function useVoiceAgentMock(): VoiceAgent {
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [isSpeaking, setIsSpeaking] = useState(false);
	const speakingIntervalRef = useRef<number | null>(null);

	const startConversation = async (opts: {
		agentId: string;
		userId?: string;
	}) => {
		// Simulate immediate connection
		const id = `mock-${Math.random().toString(36).slice(2, 10)}`;
		setConversationId(id);
		setIsConnected(true);
		if (speakingIntervalRef.current)
			window.clearInterval(speakingIntervalRef.current);
		speakingIntervalRef.current = window.setInterval(() => {
			setIsSpeaking((prev) => !prev);
		}, 1400);
	};

	const endConversation = async () => {
		if (speakingIntervalRef.current) {
			window.clearInterval(speakingIntervalRef.current);
			speakingIntervalRef.current = null;
		}
		setIsConnected(false);
		setIsSpeaking(false);
		setConversationId(null);
	};

	useEffect(() => {
		return () => {
			if (speakingIntervalRef.current) {
				window.clearInterval(speakingIntervalRef.current);
				speakingIntervalRef.current = null;
			}
			setIsConnected(false);
			setIsSpeaking(false);
		};
	}, []);

	const agentState: AgentState = !isConnected
		? null
		: isSpeaking
			? "talking"
			: "listening";

	const getInputVolume = () => {
		const t = Date.now() / 500;
		const base = Math.abs(Math.sin(t));
		return Math.min(1, (isSpeaking ? 0.6 : 0.2) + base * 0.3);
	};

	const getOutputVolume = () => {
		const t = Date.now() / 500;
		const base = Math.abs(Math.cos(t));
		return Math.min(1, (isSpeaking ? 0.7 : 0.1) + base * 0.3);
	};

	return {
		conversationId,
		agentState,
		isConnected,
		isConnecting: false,
		getInputVolume,
		getOutputVolume,
		startConversation,
		endConversation,
	};
}

// Convenience selector to avoid branching in components
// Note: This calls both hooks but does not start a session until invoked.
import { MOCK_VOICE_AGENT } from "@/lib/config";
export function useVoiceAgentAuto(): VoiceAgent {
	const real = useVoiceAgent();
	const mock = useVoiceAgentMock();
	return MOCK_VOICE_AGENT ? mock : real;
}

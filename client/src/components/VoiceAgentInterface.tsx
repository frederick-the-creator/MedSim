import { useState, useEffect, useRef } from "react";
import { useConversation } from "@elevenlabs/react";
import { Button } from "@/components/ui/button";
import { Orb, AgentState } from "@/components/ui/orb";
import { Phone, PhoneOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MOCK_VOICE_AGENT } from "@/lib/config";

// Mock flag centralized in lib/config
console.log("Mock voice agent", MOCK_VOICE_AGENT);

interface VoiceAgentInterfaceProps {
	patientName: string;
	agentId: string;
	onEndConversation?: (conversationId: string | null) => void;
}

export default function VoiceAgentInterface({
	patientName,
	agentId,
	onEndConversation,
}: VoiceAgentInterfaceProps) {
	const [conversationId, setConversationId] = useState<string | null>(null);
	const conversationIdRef = useRef<string | null>(null);
	const [isConnectedMock, setIsConnectedMock] = useState(false);
	const [isSpeakingMock, setIsSpeakingMock] = useState(false);
	const speakingIntervalRef = useRef<number | null>(null);

	const conversation = useConversation({
		onConnect: () => {
			console.log("Voice agent connected");
		},
		onDisconnect: () => {
			console.log("Voice agent disconnected");
		},
		onMessage: (message) => {
			console.log("Message received:", message);
		},
		onError: (error) => {
			console.error("Voice agent error:", error);
		},
	});

	const handleStartConversation = async () => {
		if (MOCK_VOICE_AGENT) {
			// Mock connect
			const id = `mock-${Math.random().toString(36).slice(2, 10)}`;
			setConversationId(id);
			conversationIdRef.current = id;
			setIsConnectedMock(true);
			// Toggle speaking/listening periodically
			if (speakingIntervalRef.current)
				window.clearInterval(speakingIntervalRef.current);
			speakingIntervalRef.current = window.setInterval(() => {
				setIsSpeakingMock((prev) => !prev);
			}, 1400);
			console.log("[MOCK] Conversation started with ID:", id);
			return;
		}

		try {
			const id = await conversation.startSession({
				agentId: agentId,
				connectionType: "websocket",
				userId: "fixed-user-12345",
				clientTools: {},
			});
			setConversationId(id);
			conversationIdRef.current = id;
			// Clear any parent-managed state externally
			console.log(
				"Conversation started with ID:",
				id,
				"User ID: fixed-user-12345",
			);
		} catch (error) {
			console.error("Failed to start conversation:", error);
		}
	};

	// Button for user to end conversation
	const handleEndConversation = async () => {
		const id = conversationIdRef.current;

		if (MOCK_VOICE_AGENT) {
			// Mock disconnect
			if (speakingIntervalRef.current) {
				window.clearInterval(speakingIntervalRef.current);
				speakingIntervalRef.current = null;
			}
			setIsConnectedMock(false);
			setIsSpeakingMock(false);
			setConversationId(null);
			conversationIdRef.current = null;
			console.log("[MOCK] Conversation ended. ID was:", id);
			onEndConversation?.(id ?? null);
			return;
		}

		try {
			await conversation.endSession();
			console.log("Conversation ended. ID was:", id);
		} catch (e) {
			console.error("Error ending session:", e);
		}

		setConversationId(null);
		conversationIdRef.current = null;
		onEndConversation?.(id ?? null);
	};

	// Use effect to disconnect agent when component dismounts
	useEffect(() => {
		return () => {
			if (MOCK_VOICE_AGENT) {
				if (speakingIntervalRef.current)
					window.clearInterval(speakingIntervalRef.current);
				setIsConnectedMock(false);
				setIsSpeakingMock(false);
			} else if (conversation.status === "connected") {
				conversation.endSession();
			}
		};
	}, []);

	// For Orb
	const getAgentState = (): AgentState => {
		if (MOCK_VOICE_AGENT) {
			if (!isConnectedMock) return null;
			return isSpeakingMock ? "talking" : "listening";
		}
		if (conversation.status !== "connected") return null;
		if (conversation.isSpeaking) return "talking";
		return "listening";
	};

	const isConnected = () =>
		MOCK_VOICE_AGENT ? isConnectedMock : conversation.status === "connected";
	const isConnecting = () =>
		MOCK_VOICE_AGENT ? false : conversation.status === "connecting";

	// For UI
	const getAgentStateText = () => {
		if (MOCK_VOICE_AGENT) {
			if (isConnectedMock)
				return isSpeakingMock ? "Agent is speaking" : "Listening...";
			return "Ready to start";
		}
		if (conversation.status === "connecting") return "Connecting...";
		if (conversation.status === "connected") {
			if (conversation.isSpeaking) return "Agent is speaking";
			return "Listening...";
		}
		return "Ready to start";
	};

	// For Orb
	const getInputVolume = () => {
		if (MOCK_VOICE_AGENT) {
			const t = Date.now() / 500;
			const base = Math.abs(Math.sin(t));
			return Math.min(1, (isSpeakingMock ? 0.6 : 0.2) + base * 0.3);
		}
		const raw = conversation.getInputVolume?.() ?? 0;
		return Math.min(1.0, Math.pow(raw, 0.5) * 2.5);
	};

	// For Orb
	const getOutputVolume = () => {
		if (MOCK_VOICE_AGENT) {
			const t = Date.now() / 500;
			const base = Math.abs(Math.cos(t));
			return Math.min(1, (isSpeakingMock ? 0.7 : 0.1) + base * 0.3);
		}
		const raw = conversation.getOutputVolume?.() ?? 0;
		return Math.min(1.0, Math.pow(raw, 0.5) * 2.5);
	};

	return (
		<div>
			<div className="space-y-4 h-full overflow-y-auto p-4">
				<h2 className="text-xl font-semibold" data-testid="text-patient-name">
					Voice Consultation with {patientName}
				</h2>
				<p className="text-sm text-muted-foreground">
					Click the phone button to begin the voice consultation
				</p>
			</div>

			<Card className="p-8 max-w-md w-full">
				<div className="flex flex-col items-center gap-6">
					<div
						className="relative w-48 h-48"
						data-testid="agent-state-indicator"
					>
						<div className="absolute inset-0 bg-muted rounded-full p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
							<div
								className="relative w-full h-full bg-background rounded-full shadow-[inset_0_0_12px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_12px_rgba(0,0,0,0.3)]"
								style={{ overflow: "hidden" }}
							>
								<Orb
									key="voice-orb"
									colors={["#7C3AED", "#A78BFA"]}
									agentState={getAgentState()}
									volumeMode="manual"
									getInputVolume={getInputVolume}
									getOutputVolume={getOutputVolume}
								/>
							</div>
						</div>
					</div>

					<div className="text-center">
						<p className="text-lg font-medium" data-testid="text-agent-status">
							{getAgentStateText()}
						</p>
						<p className="text-sm text-muted-foreground mt-2">
							{isConnected()
								? "Speak naturally to communicate with the patient"
								: "Press the phone button to start"}
						</p>
					</div>

					<div className="flex gap-4">
						{!isConnected() ? (
							<Button
								onClick={handleStartConversation}
								size="lg"
								className="rounded-full w-16 h-16"
								disabled={isConnecting()}
								data-testid="button-start-call"
							>
								<Phone className="w-6 h-6" />
							</Button>
						) : (
							<Button
								onClick={handleEndConversation}
								size="lg"
								variant="destructive"
								className="rounded-full w-16 h-16"
								data-testid="button-end-call"
							>
								<PhoneOff className="w-6 h-6" />
							</Button>
						)}
					</div>

					{conversationId && (
						<p
							className="text-xs text-muted-foreground"
							data-testid="text-conversation-id"
						>
							Conversation ID: {conversationId.substring(0, 8)}...
						</p>
					)}

					{/* Assessment UI handled by parent */}
				</div>
			</Card>

			{/* Tip card removed; guidance handled elsewhere if needed */}
		</div>
	);
}

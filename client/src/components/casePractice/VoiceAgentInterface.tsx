import { Button } from "@/components/ui/button";
import { Orb } from "@/components/ui/orb";
import { Phone, PhoneOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useVoiceAgentAuto } from "@/hooks/useVoiceAgent";

interface VoiceAgentInterfaceProps {
	patientName: string;
	agentId: string;
	onConversationEnd: (conversationId: string | null) => void;
}

export default function VoiceAgentInterface({
	patientName,
	agentId,
	onConversationEnd,
}: VoiceAgentInterfaceProps) {
	const voiceAgent = useVoiceAgentAuto({ onConversationEnd });

	const handleStartConversation = async () => {
		await voiceAgent.startConversation({ agentId, userId: "fixed-user-12345" });
	};

	const handleEndConversation = async () => {
		await voiceAgent.endConversation();
	};

	const getAgentStateText = () => {
		if (voiceAgent.isConnecting) return "Connecting...";
		if (voiceAgent.isConnected) return voiceAgent.agentState === "talking" ? "Agent is speaking" : "Listening...";
		return "Ready to start";
	};

	return (
		<div>
			<div className="space-y-4 h-full overflow-y-auto p-4">
				<h2 className="text-xl font-semibold" data-testid="text-patient-name">
					Consultation with {patientName}
				</h2>
			</div>

			<Card className="p-8 max-w-md w-full">
				<div className="flex flex-col items-center gap-6">
					<div
						className="relative w-48 h-48"
						data-testid="voiceAgent-state-indicator"
					>
						<div className="absolute inset-0 bg-muted rounded-full p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
							<div
								className="relative w-full h-full bg-background rounded-full shadow-[inset_0_0_12px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_12px_rgba(0,0,0,0.3)]"
								style={{ overflow: "hidden" }}
							>
								<Orb
									key="voice-orb"
									colors={["#7C3AED", "#A78BFA"]}
									agentState={voiceAgent.agentState}
									volumeMode="manual"
									getInputVolume={voiceAgent.getInputVolume}
									getOutputVolume={voiceAgent.getOutputVolume}
								/>
							</div>
						</div>
					</div>

					<div className="text-center">
						<p className="text-lg font-medium" data-testid="text-voiceAgent-status">
							{getAgentStateText()}
						</p>
						<p className="text-sm text-muted-foreground mt-2">
							{voiceAgent.isConnected
								? "Speak naturally to communicate with the patient"
								: "Press the phone button to start"}
						</p>
					</div>

					<div className="flex gap-4">
						{!voiceAgent.isConnected ? (
							<Button
								onClick={handleStartConversation}
								size="lg"
								className="rounded-full w-16 h-16"
								disabled={voiceAgent.isConnecting}
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

					{voiceAgent.conversationId && (
						<p
							className="text-xs text-muted-foreground"
							data-testid="text-conversation-id"
						>
							Conversation ID: {voiceAgent.conversationId.substring(0, 8)}...
						</p>
					)}

				</div>
			</Card>
		</div>
	);
}

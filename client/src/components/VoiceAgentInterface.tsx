import { Button } from "@/components/ui/button";
import { Orb } from "@/components/ui/orb";
import { Phone, PhoneOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useVoiceAgentAuto } from "@/hooks/useVoiceAgent";

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
	const agent = useVoiceAgentAuto();

	const handleStartConversation = async () => {
		await agent.startConversation({ agentId, userId: "fixed-user-12345" });
	};

	const handleEndConversation = async () => {
		const id = agent.conversationId;
		await agent.endConversation();
		onEndConversation?.(id ?? null);
	};

	const getAgentStateText = () => {
		if (agent.isConnecting) return "Connecting...";
		if (agent.isConnected) return agent.agentState === "talking" ? "Agent is speaking" : "Listening...";
		return "Ready to start";
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
									agentState={agent.agentState}
									volumeMode="manual"
									getInputVolume={agent.getInputVolume}
									getOutputVolume={agent.getOutputVolume}
								/>
							</div>
						</div>
					</div>

					<div className="text-center">
						<p className="text-lg font-medium" data-testid="text-agent-status">
							{getAgentStateText()}
						</p>
						<p className="text-sm text-muted-foreground mt-2">
							{agent.isConnected
								? "Speak naturally to communicate with the patient"
								: "Press the phone button to start"}
						</p>
					</div>

					<div className="flex gap-4">
						{!agent.isConnected ? (
							<Button
								onClick={handleStartConversation}
								size="lg"
								className="rounded-full w-16 h-16"
								disabled={agent.isConnecting}
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

					{agent.conversationId && (
						<p
							className="text-xs text-muted-foreground"
							data-testid="text-conversation-id"
						>
							Conversation ID: {agent.conversationId.substring(0, 8)}...
						</p>
					)}

				</div>
			</Card>
		</div>
	);
}

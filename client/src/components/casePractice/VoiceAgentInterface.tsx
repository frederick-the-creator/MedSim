import { Button } from "@/components/ui/button";
import { Orb } from "@/components/ui/orb";
import { Phone, PhoneOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useVoiceAgentAuto } from "@/hooks/useVoiceAgent";
import { useEffect, useRef, useState } from "react";

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

	// Timer state
	const [durationMinutes, setDurationMinutes] = useState<number>(8);
	const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
	const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const autoEndTriggeredRef = useRef<boolean>(false);

	const formatMmSs = (total: number) => {
		const m = Math.floor(total / 60);
		const s = total % 60;
		return `${m}:${s.toString().padStart(2, "0")}`;
	};

	const handleStartConversation = async () => {
		await voiceAgent.startConversation({ agentId, userId: "fixed-user-12345" });
	};

	const handleEndConversation = async () => {
		await voiceAgent.endConversation();
	};

	// Start/stop countdown on connect/disconnect
	useEffect(() => {
		if (voiceAgent.isConnected) {
			// initialize remaining time based on current duration
			setRemainingSeconds(durationMinutes * 60);
			// clear any existing interval
			if (countdownRef.current) {
				clearInterval(countdownRef.current);
			}
			autoEndTriggeredRef.current = false;
			countdownRef.current = setInterval(() => {
				setRemainingSeconds((prev) => {
					if (prev === null) return null;
					return prev > 0 ? prev - 1 : 0;
				});
			}, 1000);
		} else {
			// disconnected: clear interval and reset
			if (countdownRef.current) {
				clearInterval(countdownRef.current);
				countdownRef.current = null;
			}
			setRemainingSeconds(null);
			autoEndTriggeredRef.current = false;
		}

		return () => {
			if (countdownRef.current) {
				clearInterval(countdownRef.current);
				countdownRef.current = null;
			}
		};
	}, [voiceAgent.isConnected, durationMinutes]);

	// Auto-end when time runs out
	useEffect(() => {
		if (!voiceAgent.isConnected) return;
		if (remainingSeconds === 0 && !autoEndTriggeredRef.current) {
			autoEndTriggeredRef.current = true;
			// fire and forget
			void handleEndConversation();
		}
	}, [remainingSeconds, voiceAgent.isConnected]);

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

				<div className="flex items-center gap-4">
					{!voiceAgent.isConnected ? (
						<>
							<label htmlFor="timer-minutes" className="sr-only">Timer (min)</label>
							<div className="flex items-center">
								<input
									id="timer-minutes"
									type="number"
									min={1}
									max={120}
									value={durationMinutes}
									onChange={(e) => {
										const next = Number(e.target.value);
										if (Number.isNaN(next)) return;
										setDurationMinutes(Math.max(1, Math.min(120, next)));
									}}
									className="w-20 h-10 px-3 py-2 rounded-l-md border border-r-0 bg-background text-sm"
									data-testid="input-timer-minutes"
									disabled={voiceAgent.isConnecting}
								/>
								<span
									className="h-10 inline-flex items-center px-2 rounded-r-md border border-l-0 bg-muted text-muted-foreground text-sm select-none"
									data-testid="input-timer-unit"
								>
									mins
								</span>
							</div>

							<Button
								onClick={handleStartConversation}
								size="lg"
								className="rounded-full w-16 h-16"
								disabled={voiceAgent.isConnecting}
								data-testid="button-start-call"
							>
								<Phone className="w-6 h-6" />
							</Button>
						</>
					) : (
						<>
							<span
								className={
									`px-3 py-1 rounded-full text-sm font-medium ` +
									(remainingSeconds !== null && remainingSeconds <= 60
										? "bg-red-100 text-red-700 animate-pulse"
										: "bg-muted")
								}
								data-testid="badge-timer-remaining"
							>
								{formatMmSs(remainingSeconds ?? durationMinutes * 60)}
							</span>

							<Button
								onClick={handleEndConversation}
								size="lg"
								variant="destructive"
								className="rounded-full w-16 h-16"
								data-testid="button-end-call"
							>
								<PhoneOff className="w-6 h-6" />
							</Button>
						</>
					)}
				</div>
				</div>
			</Card>
		</div>
	);
}

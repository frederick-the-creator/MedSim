import { useState, useEffect, useRef, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import Header from "@/components/shared/Header";
import CaseBrief from "@/components/casePractice/CaseBrief";
import VoiceAgentInterface from "@/components/casePractice/VoiceAgentInterface";
import TwoColumnRow from "@/components/casePractice/TwoColumnRow";
import MessageDialog from "@/components/casePractice/MessageDialog";
import { postCoachAndStream } from "@/lib/coach";
import CoachInterface from "@/components/casePractice/CoachInterface";
import { medicalCases } from "@shared/cases";
import type { Assessment } from "@shared/schemas/assessment";
import AssessmentCard from "@/components/casePractice/AssessmentCard";
import type { CoachMessage, CoachRequestBody } from "@shared/schemas/coach";
import { useAssessmentAuto } from "@/hooks/useAssessment";
 

export default function CasePractice() {
	const [, params] = useRoute("/case/:id");
	const [, setLocation] = useLocation();
	const [isAssessmentLoading, setIsAssessmentLoading] = useState(false);
	const [assessment, setAssessment] = useState<Assessment | null>(null);
	const [transcript, setTranscript] = useState<string | null>(null);
	const [coachMessages, setCoachMessages] = useState<CoachMessage[]>([]);
	const [isChatLoading, setIsChatLoading] = useState(false);
	const [assessmentError, setAssessmentError] = useState<string | null>(null);
	const [isErrorOpen, setIsErrorOpen] = useState(false);
	const secondRowRef = useRef<HTMLDivElement | null>(null);

	const caseId = params?.id ? parseInt(params.id) : null;
	const medicalCase = medicalCases.find((c) => c.id === caseId);

	// Auto-select real vs mock assessment hook
	const assessmentHook = useAssessmentAuto();

	useEffect(() => {
		// Reset state when case changes
		setIsAssessmentLoading(false);
		setAssessment(null);
		setTranscript(null);
	}, [caseId]);

	useEffect(() => {
		if (assessment && secondRowRef.current) {
			secondRowRef.current.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}
	}, [assessment]);

	if (!medicalCase) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">Case not found</h1>
					<button
						onClick={() => setLocation("/")}
						className="text-primary hover:underline"
					>
						Return to home
					</button>
				</div>
			</div>
		);
	}

	const handleNewCase = () => {
		setLocation("/");
	};

	const handleBack = () => {
		setLocation("/");
	};

	const handleEndConversation = useCallback((conversationId: string | null | undefined) => {
		if (!conversationId) return;
		(async () => {
			try {
				setIsAssessmentLoading(true);
				await assessmentHook.run(conversationId, medicalCase);
				if (assessmentHook.error) {
					throw new Error(assessmentHook.error);
				}
				setAssessment(assessmentHook.assessment);
				setTranscript(assessmentHook.transcript);
			} catch (e: any) {
				setAssessment(null);
				setTranscript(null);
				setAssessmentError(e?.message ?? "Failed to generate assessment.");
				setIsErrorOpen(true);
			} finally {
				setIsAssessmentLoading(false);
			}
		})();
	}, [medicalCase, assessmentHook]);

	const handleSendMessage = useCallback((text: string) => {
		const userMsg: CoachMessage = {
			id: `${Date.now()}`,
			role: "user",
			content: text,
			timestamp: new Date(),
		};
		setCoachMessages((prev: any[]) => [...prev, userMsg]);
		const assistantId = `${Date.now()}-assist`;
		setCoachMessages((prev: any[]) => [
			...prev,
			{
				id: assistantId,
				role: "assistant",
				content: "",
				timestamp: new Date(),
			},
		]);
		setIsChatLoading(true);
		(async () => {
			try {
				if (!transcript || !assessment) {
					throw new Error("Missing transcript or assessment");
				}
				const body: CoachRequestBody = {
					messages: [...coachMessages, userMsg],
					transcript,
					assessment: JSON.stringify(assessment),
					medicalCase,
				};
				await postCoachAndStream(body, (acc: string) => {
					setCoachMessages((prev: any[]) =>
						prev.map((m: any) => (m.id === assistantId ? { ...m, content: acc } : m)),
					);
				});
			} catch (e) {
				const errText = (e as any)?.message || "Chat failed";
				setCoachMessages((prev: any[]) =>
					prev.map((m: any) => (m.id === assistantId ? { ...m, content: errText } : m)),
				);
			} finally {
				setIsChatLoading(false);
			}
		})();
	}, [coachMessages, transcript, assessment, medicalCase]);

	return (
		<div className="min-h-screen flex flex-col bg-background">
			<Header showBackButton onBack={handleBack} />

			<main className="container mx-auto px-4 py-8">
				<TwoColumnRow
					left={
						<CaseBrief medicalCase={medicalCase} />
					}
					right={
						<VoiceAgentInterface
							patientName={medicalCase.vignette.background.patientName}
							agentId={medicalCase.agentId}
							onEndConversation={handleEndConversation}
						/>
					}
				/>

				{assessment && transcript && (
					<div ref={secondRowRef} className="mt-8">
						<TwoColumnRow
							split="1-1"
							className="h-[70vh]"
							left={
								<AssessmentCard assessment={assessment} />
							}
							right={
								<CoachInterface
									messages={coachMessages}
									onSendMessage={handleSendMessage}
									isLoading={isChatLoading}
								/>
							}
						/>
					</div>
				)}

				<MessageDialog
					open={isAssessmentLoading}
					onOpenChange={(open) => !open && setIsAssessmentLoading(false)}
					title="Generating assessment…"
					showSpinner
				/>

				<MessageDialog
					open={isErrorOpen}
					onOpenChange={setIsErrorOpen}
					title="Assessment failed"
					description={assessmentError || "Something went wrong. Please try again later."}
					actionLabel="OK"
					onAction={() => setIsErrorOpen(false)}
				/>
			</main>
		</div>
	);
}

import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import Header from "@/components/Header";
import CaseBrief from "@/components/CaseBrief";
import VoiceAgentInterface from "@/components/VoiceAgentInterface";
import TwoColumnRow from "@/components/layout/TwoColumnRow";
import AssessmentDialog from "@/components/AssessmentDialog";
import { fetchAssessment } from "@/lib/assessment";
import { postChatAndStream } from "@/lib/chat";
import ChatInterface from "@/components/ChatInterface";
import { medicalCases } from "@shared/cases";
import type { Assessment } from "@shared/schemas/assessment";
import AssessmentCard from "@/components/AssessmentCard";
 

export default function CaseDetail() {
	const [, params] = useRoute("/case/:id");
	const [, setLocation] = useLocation();
	const [isAssessmentLoading, setIsAssessmentLoading] = useState(false);
	const [assessment, setAssessment] = useState<Assessment | null>(null);
	const [transcript, setTranscript] = useState<string | null>(null);
	const [chatMessages, setChatMessages] = useState([] as any[]);
	const [isChatLoading, setIsChatLoading] = useState(false);
	const secondRowRef = useRef<HTMLDivElement | null>(null);

	const caseId = params?.id ? parseInt(params.id) : null;
	const medicalCase = medicalCases.find((c) => c.id === caseId);

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
							patientName={medicalCase.patientName}
							agentId={medicalCase.agentId}
							onEndConversation={async (conversationId) => {
										if (!conversationId) return;
										try {
											setIsAssessmentLoading(true);
											const result = await fetchAssessment(conversationId);
											setAssessment(result.assessment);
											setTranscript(result.transcript);
										} catch (e: any) {
											setAssessment(e?.message ?? "Assessment failed");
										} finally {
											setIsAssessmentLoading(false);
										}
							}}
						/>
					}
				/>

					{assessment && (
					<div ref={secondRowRef} className="mt-8">
							<TwoColumnRow
								split="1-1"
								className="h-[70vh]"
							left={
									<AssessmentCard assessment={assessment} />
							}
							right={
									<ChatInterface
										messages={chatMessages as any}
										onSendMessage={async (text) => {
											const userMsg = {
												id: `${Date.now()}`,
												role: "user",
												content: text,
												timestamp: new Date(),
											};
											setChatMessages((prev: any[]) => [...prev, userMsg]);
											const assistantId = `${Date.now()}-assist`;
											setChatMessages((prev: any[]) => [
												...prev,
												{
													id: assistantId,
													role: "assistant",
													content: "",
													timestamp: new Date(),
												},
											]);
											setIsChatLoading(true);
											try {
											const body = {
												messages: [...chatMessages, userMsg].map(
													(m: any) => ({ role: m.role, content: m.content }),
												),
												transcript: transcript ?? "",
												assessment: assessment ? JSON.stringify(assessment) : "",
											};
											await postChatAndStream(body, (acc) => {
												setChatMessages((prev: any[]) =>
													prev.map((m: any) =>
														m.id === assistantId ? { ...m, content: acc } : m,
													),
												);
											});
											} catch (e) {
												const errText = (e as any)?.message || "Chat failed";
												setChatMessages((prev: any[]) =>
													prev.map((m: any) =>
														m.id === assistantId
															? { ...m, content: errText }
															: m,
													),
												);
											} finally {
												setIsChatLoading(false);
											}
										}}
										isLoading={isChatLoading}
									/>
							}
						/>
					</div>
				)}

				<AssessmentDialog
					open={isAssessmentLoading}
					onOpenChange={(open) => !open && setIsAssessmentLoading(false)}
				/>
			</main>
		</div>
	);
}

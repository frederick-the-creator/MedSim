import { useState, useEffect, useRef, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import Header from "@/components/shared/Header";
import CaseBrief from "@/components/casePractice/CaseBrief";
import VoiceAgentInterface from "@/components/casePractice/VoiceAgentInterface";
import MessageDialog from "@/components/casePractice/MessageDialog";
import { useCoach } from "@/hooks/useCoach";
import CoachInterface from "@/components/casePractice/CoachInterface";
import { medicalCases } from "@shared/cases";
import AssessmentCard from "@/components/casePractice/AssessmentCard";
import type { CoachMessage, CoachRequestBody } from "@shared/schemas/coach";
import { useAssessmentAuto } from "@/hooks/useAssessment";
 

export default function CasePractice() {
	const [, params] = useRoute("/case/:id");
	const [, setLocation] = useLocation();
	const [coachMessages, setCoachMessages] = useState<CoachMessage[]>([]);
	const [isChatLoading, setIsChatLoading] = useState(false);
	const [isErrorOpen, setIsErrorOpen] = useState(false);
	const secondRowRef = useRef<HTMLDivElement | null>(null);

	const caseId = params?.id ? parseInt(params.id) : null;
	const medicalCase = medicalCases.find((c) => c.id === caseId);

	// Auto-select real vs mock assessment hook
	const { assessment, transcript, assessmentLoading, assessmentError, runAssessment, resetAssessment } = useAssessmentAuto();
	const { postCoachAndStream } = useCoach();

	useEffect(() => {
		// Reset assessment state when case changes
		resetAssessment();
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
				await runAssessment(conversationId, medicalCase);
			} catch (e: any) {
				setIsErrorOpen(true);
			}
		})();
	}, [medicalCase, runAssessment]);

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
					// conversationId,
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
			{/*
				min-h-screen: Set minimum height of viewport to whole screen
				* flex-col: Children are vertical (header, main)
			*/}
			<Header showBackButton onBack={handleBack} />

			<main className="container mx-auto px-4 py-8">
				{/*
					container: Centers your content and sets a max-width that adjusts responsively at different breakpoints (e.g., sm, md, lg).
					mx-auto: Sets horizontal margins to auto, centering the container horizontally on the page.
				*/}

				{/* Row One */}
				<div className={`grid lg:grid-cols-[2fr_1fr] gap-6`}>
					{/* 
						grid - makes into grid container
						lg: - Applies to large screens only (on mobile all columns just get stacked vertically)
						grid-cols-[1fr_1fr] - Grid of columns of equal width
						gap-6: Gap between each column (horizontally, or vertical on mobile when stacked)
					*/}
					<div className="left bg-card border rounded-xl p-4 shadow-card animate-scale-in max-h-[70svh] md:max-h-[70vh] flex flex-col min-h-0">
							{/* 
								bg-card: Sets background to custom colour
								border: Add 1px border
								border-border: Sets border to custom colour
								shadow-card: Adds box shadow to make the element look raised like a card.
								animate-scale-in: Adds custom animation that makes the element scale up slightly as it appears
								flex - Set to flex
								flex-col - Set flex-direction to column. 
								max-h-[70svh] md:max-h-[70vh] - Prevents this from taking up more than 70% of viewport height -> Result is CaseBrief now scrolls to stop it taking up more than vh
										- md: apply this from the medium breakpoint upwards (i.e. only use 70vh for larger screens, use 70svh for small / mobile)
								min-h-0 - Forces children to shrink (vertically). 
										- Flex containers automatically shrink children horizontally. 
										- But vertically, without this, min-height: auto is set which forces the element to grow to fit its content.
							*/}
						<CaseBrief medicalCase={medicalCase} />
					</div>
					<div className="right bg-card border rounded-xl p-4 shadow-card animate-scale-in min-h-0">
						<VoiceAgentInterface
							patientName={medicalCase.vignette.background.patientName}
							agentId={medicalCase.agentId}
							onConversationEnd={handleEndConversation}
						/>
					</div>
				</div>

				{/* Second Row */}
				{assessment && transcript && (
					<div ref={secondRowRef} className={`grid lg:grid-cols-[1fr_1fr] gap-6 mt-8`}>
						{/*
							mt-8: Adds margin to top
						*/}
						<div className="left bg-card border rounded-xl p-4 shadow-card animate-scale-in max-h-[70svh] md:max-h-[70vh] flex flex-col">
							<AssessmentCard assessment={assessment} />
						</div>
						<div className="right bg-card border border-border rounded-xl p-4 shadow-card animate-scale-in max-h-[70svh] md:max-h-[70vh] flex flex-col min-h-0">
							{/*
								Size is dictated currently by:
									- min-h-0 doesn't affect as forces children to shrink instead of expanding itself
									- Content will dictate size
									- Applying max-h-[70svh] md:max-h-[70vh] now dictates height
							*/}
							<CoachInterface
									messages={coachMessages}
									onSendMessage={handleSendMessage}
									isLoading={isChatLoading}
								/>
						</div>
					</div>
				)}

				<MessageDialog
					open={assessmentLoading}
					onOpenChange={() => {}}
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

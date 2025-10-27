import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import Header from "@/components/Header";
import CaseBrief from "@/components/CaseBrief";
import VoiceAgentInterface from "@/components/VoiceAgentInterface";
import TwoColumnRow from "@/components/layout/TwoColumnRow";
import AssessmentDialog from "@/components/AssessmentDialog";
import { MOCK_VOICE_AGENT } from "@/lib/config";
import ChatInterface from "@/components/ChatInterface";
import FeedbackDisplay from "@/components/FeedbackDisplay";
import { medicalCases } from "@shared/cases";
import { ConversationFeedback } from "@shared/schema";

export default function CaseDetail() {
  const [, params] = useRoute("/case/:id");
  const [, setLocation] = useLocation();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<ConversationFeedback | null>(null);
  const [isAssessmentLoading, setIsAssessmentLoading] = useState(false);
  const [assessment, setAssessment] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState([] as any[]);
  const secondRowRef = useRef<HTMLDivElement | null>(null);

  const caseId = params?.id ? parseInt(params.id) : null;
  const medicalCase = medicalCases.find((c) => c.id === caseId);

  useEffect(() => {
    // Reset state when case changes
    setShowFeedback(false);
    setFeedback(null);
    setIsAssessmentLoading(false);
    setAssessment(null);
  }, [caseId]);

  useEffect(() => {
    if (assessment && secondRowRef.current) {
      secondRowRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
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
                      if (MOCK_VOICE_AGENT) {
                        
                        // Simulate 5s backend processing delay in mock mode
                        await new Promise((resolve) => setTimeout(resolve, 5000));
                        const mockAssessment = `"assessment": "This was a good start to the consultation, demonstrating empathy and a structured approach.\n\n**Strengths:**\n\n*   **History Taking:** You gathered relevant information about the onset, symptoms, and laterality of the eye pain. You also inquired about medical and ocular history, including contact lens use and trauma.\n*   **Empathy & Rapport:** You acknowledged the patient's pain and anxiety, showing concern and understanding.\n*   **Explanation:** You clearly explained the diagnosis of a corneal ulcer and the proposed management plan.\n*   **Safety Netting:** You provided clear instructions on when to return to the A&E if symptoms worsen.\n*   **ICE:** You elicited the patient's concern about the seriousness of the condition and specifically addressed her fear about her sight.\n\n**Areas for Improvement:**\n\n*   **History Taking:** As highlighted by the agent, include specific questions about recent swimming or water exposure early in the history to assess the risk of microbial or Acanthamoeba keratitis. Always check visual acuity in *both* eyes (with pinhole if necessary).\n*   **Clinical Reasoning & Safety-netting:** Explicitly state contraindications, such as the avoidance of steroids, and emphasize the urgent need for ophthalmological review.\n*   **Communication:** While empathetic, use signposting to manage patient anxiety (e.g., \"I'll ask a few quick questions so we can help your pain faster\"). Chunk information and check for understanding more frequently.\n*   **Practicalities:** While you provided a leaflet, ensure the patient knows how to use the antibiotic drops correctly (frequency, instillation technique). Confirm the follow-up appointment details.\n\n**Actionable Improvements:**\n\n1.  **Revise History Template:** Add \"Do you wear contact lenses? Any swimming or water in the eye recently?\" directly after pain/vision questions.\n2.  **Verbalize Key Safety Points:** When explaining management, state: \"It's important *not* to use any steroid eye drops. We need an ophthalmologist to see you today.\"\n3.  **Enhance Communication:** Use signposting (\"I'll ask a few quick questions...\"), chunk information, and frequently check for understanding. Demonstrate active listening by reflecting back the patient's concerns."`;
                        setAssessment(mockAssessment);
                      } else {
                        const resp = await fetch("/api/assessment", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ conversationId }),
                        });
                        if (!resp.ok) {
                          const errJson = await resp.json().catch(() => ({} as any));
                          const message = (errJson && (errJson.message as string)) || `Server error ${resp.status}`;
                          throw new Error(message);
                        }
                        const json = await resp.json();
                        setAssessment(json.assessment ?? null);
                      }
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
              left={
                <div className="bg-card border border-border rounded-xl p-6 shadow-card whitespace-pre-wrap text-sm text-foreground">
                  {assessment}
                </div>
              }
              right={
                <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                  <ChatInterface
                    messages={chatMessages as any}
                    onSendMessage={(msg) => {
                      setChatMessages((prev: any[]) => [
                        ...prev,
                        { id: `${Date.now()}`, role: 'user', content: msg },
                      ]);
                    }}
                  />
                </div>
              }
            />
          </div>
        )}

        <AssessmentDialog open={isAssessmentLoading} onOpenChange={(open) => !open && setIsAssessmentLoading(false)} />
      </main>
    </div>
  );
}

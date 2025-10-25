import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import Header from "@/components/Header";
import CaseBrief from "@/components/CaseBrief";
import VoiceAgentInterface from "@/components/VoiceAgentInterface";
import FeedbackDisplay from "@/components/FeedbackDisplay";
import { medicalCases } from "@shared/cases";
import { ConversationFeedback } from "@shared/schema";

export default function CaseDetail() {
  const [, params] = useRoute("/case/:id");
  const [, setLocation] = useLocation();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<ConversationFeedback | null>(null);

  const caseId = params?.id ? parseInt(params.id) : null;
  const medicalCase = medicalCases.find((c) => c.id === caseId);

  useEffect(() => {
    // Reset state when case changes
    setShowFeedback(false);
    setFeedback(null);
  }, [caseId]);

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

      <main className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-3">
          <div className="border-r overflow-hidden">
            <CaseBrief medicalCase={medicalCase} />
          </div>

          <div className="lg:col-span-2 overflow-hidden">
            {showFeedback && feedback ? (
              <FeedbackDisplay feedback={feedback} onNewCase={handleNewCase} />
            ) : (
              <VoiceAgentInterface
                patientName={medicalCase.patientName}
                agentId={medicalCase.agentId}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

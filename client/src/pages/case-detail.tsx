import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import Header from "@/components/Header";
import CaseBrief from "@/components/CaseBrief";
import ChatInterface from "@/components/ChatInterface";
import FeedbackDisplay from "@/components/FeedbackDisplay";
import { medicalCases } from "@shared/cases";
import { ChatMessage, ConversationFeedback } from "@shared/schema";

export default function CaseDetail() {
  const [, params] = useRoute("/case/:id");
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<ConversationFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const caseId = params?.id ? parseInt(params.id) : null;
  const medicalCase = medicalCases.find(c => c.id === caseId);

  useEffect(() => {
    // Reset state when case changes
    setMessages([]);
    setShowFeedback(false);
    setFeedback(null);
  }, [caseId]);

  if (!medicalCase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Case not found</h1>
          <button onClick={() => setLocation("/")} className="text-primary hover:underline">
            Return to home
          </button>
        </div>
      </div>
    );
  }

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Check for feedback trigger
    const feedbackTriggers = ['feedback mode', 'goodbye', 'thank you for your time', 'that\'s all'];
    const shouldTriggerFeedback = feedbackTriggers.some(trigger => 
      content.toLowerCase().includes(trigger)
    );

    if (shouldTriggerFeedback && !showFeedback) {
      setIsLoading(true);
      
      // Simulate AI response delay
      setTimeout(() => {
        // Generate mock feedback (in real app, this would be from OpenAI)
        const mockFeedback: ConversationFeedback = {
          overall: "Good consultation approach. You demonstrated understanding of the case and communicated clearly with the patient. Keep working on exploring ICE systematically.",
          sections: [
            {
              category: "History Taking",
              score: 8,
              maxScore: 10,
              comments: ["Good systematic approach to history"],
              strengths: ["Asked about symptom onset", "Explored exacerbating factors"],
              improvements: ["Could probe deeper into patient's daily activities"]
            },
            {
              category: "Clinical Reasoning",
              score: 7,
              maxScore: 10,
              comments: ["Sound clinical reasoning demonstrated"],
              strengths: ["Identified key clinical findings", "Appropriate management plan"],
              improvements: ["Consider discussing differential diagnoses more explicitly"]
            },
            {
              category: "Communication & Empathy",
              score: 9,
              maxScore: 10,
              comments: ["Excellent empathetic communication"],
              strengths: ["Used plain language", "Showed genuine concern"],
              improvements: ["Could check understanding more frequently"]
            },
            {
              category: "ICE Coverage",
              score: 6,
              maxScore: 10,
              comments: ["Partial coverage of ICE"],
              strengths: ["Asked about patient concerns"],
              improvements: ["Did not fully explore patient's ideas about the condition", "Missed exploring expectations for treatment"]
            }
          ]
        };

        setFeedback(mockFeedback);
        setShowFeedback(true);
        setIsLoading(false);
      }, 1500);
    } else if (!showFeedback) {
      setIsLoading(true);
      
      // Simulate patient AI response (in real app, this would use OpenAI with patient profile)
      setTimeout(() => {
        const patientMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: getSimulatedPatientResponse(content, medicalCase),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, patientMessage]);
        setIsLoading(false);
      }, 800);
    }
  };

  const getSimulatedPatientResponse = (userMessage: string, caseData: any): string => {
    // Simple mock responses based on keywords (real app would use OpenAI)
    const lower = userMessage.toLowerCase();
    
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('introduce')) {
      return `Hello doctor. Thanks for seeing me.`;
    }
    
    if (lower.includes('concern') || lower.includes('worried')) {
      return caseData.patientProfile.concerns[0] || "I'm just worried about what's happening.";
    }
    
    if (lower.includes('expect') || lower.includes('hoping')) {
      return caseData.patientProfile.expectations[0] || "I just want to get better as soon as possible.";
    }
    
    if (lower.includes('pain') || lower.includes('hurt') || lower.includes('sore')) {
      return "Yes, it's quite painful, especially when I look at bright lights.";
    }
    
    if (lower.includes('when') || lower.includes('start')) {
      return "It started last night, but it got much worse this morning.";
    }

    if (lower.includes('contact') || lower.includes('lens') || lower.includes('wear')) {
      return "Yes, I wear contact lenses every day. Sometimes I forget to take them out before bed.";
    }
    
    return "I'm not sure, doctor. What do you think?";
  };

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
              <ChatInterface
                patientName={medicalCase.patientName}
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

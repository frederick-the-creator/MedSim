import { useState, useEffect, useRef } from "react";
import { useConversation } from "@elevenlabs/react";
import { Button } from "@/components/ui/button";
import { Orb, AgentState } from "@/components/ui/orb";
import { Phone, PhoneOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// Enable mock mode by setting VITE_MOCK_VOICE_AGENT=true in client/.env.local
const raw = (import.meta as any).env?.VITE_MOCK_VOICE_AGENT;
if (raw == null) throw new Error("VITE_MOCK_VOICE_AGENT is required. Set it to 'true' or 'false' in client/.env.local");
const MOCK_VOICE_AGENT = raw === "true";

interface VoiceAgentInterfaceProps {
  patientName: string;
  agentId: string;
}

export default function VoiceAgentInterface({ 
  patientName, 
  agentId
}: VoiceAgentInterfaceProps) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessment, setAssessment] = useState<string | null>(null);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);
  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false);
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
      setAssessment(null);
      setAssessmentError(null);
      setIsAssessmentDialogOpen(false);
      setIsConnectedMock(true);
      // Toggle speaking/listening periodically
      if (speakingIntervalRef.current) window.clearInterval(speakingIntervalRef.current);
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
      setAssessment(null);
      setAssessmentError(null);
      setIsAssessmentDialogOpen(false);
      console.log("Conversation started with ID:", id, "User ID: fixed-user-12345");
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

      if (id) {
        try {
          setIsAssessing(true);
          setAssessmentError(null);
          await new Promise((resolve) => setTimeout(resolve, 800));
          const fixedAssessment = `"assessment": "This was a good start to the consultation, demonstrating empathy and a structured approach.\n\n**Strengths:**\n\n*   **History Taking:** You gathered relevant information about the onset, symptoms, and laterality of the eye pain. You also inquired about medical and ocular history, including contact lens use and trauma.\n*   **Empathy & Rapport:** You acknowledged the patient's pain and anxiety, showing concern and understanding.\n*   **Explanation:** You clearly explained the diagnosis of a corneal ulcer and the proposed management plan.\n*   **Safety Netting:** You provided clear instructions on when to return to the A&E if symptoms worsen.\n*   **ICE:** You elicited the patient's concern about the seriousness of the condition and specifically addressed her fear about her sight.\n\n**Areas for Improvement:**\n\n*   **History Taking:** As highlighted by the agent, include specific questions about recent swimming or water exposure early in the history to assess the risk of microbial or Acanthamoeba keratitis. Always check visual acuity in *both* eyes (with pinhole if necessary).\n*   **Clinical Reasoning & Safety-netting:** Explicitly state contraindications, such as the avoidance of steroids, and emphasize the urgent need for ophthalmological review.\n*   **Communication:** While empathetic, use signposting to manage patient anxiety (e.g., "I'll ask a few quick questions so we can help your pain faster"). Chunk information and check for understanding more frequently.\n*   **Practicalities:** While you provided a leaflet, ensure the patient knows how to use the antibiotic drops correctly (frequency, instillation technique). Confirm the follow-up appointment details.\n\n**Actionable Improvements:**\n\n1.  **Revise History Template:** Add "Do you wear contact lenses? Any swimming or water in the eye recently?" directly after pain/vision questions.\n2.  **Verbalize Key Safety Points:** When explaining management, state: "It's important *not* to use any steroid eye drops. We need an ophthalmologist to see you today."\n3.  **Enhance Communication:** Use signposting ("I'll ask a few quick questions..."), chunk information, and frequently check for understanding. Demonstrate active listening by reflecting back the patient's concerns."`;
          setAssessment(fixedAssessment);
          setIsAssessmentDialogOpen(true);
        } catch (e: any) {
          console.error("[MOCK] Assessment failed", e);
          setAssessmentError(e?.message ?? "Assessment failed");
        } finally {
          setIsAssessing(false);
          setConversationId(null);
          conversationIdRef.current = null;
        }
      } else {
        setConversationId(null);
        conversationIdRef.current = null;
        setIsAssessmentDialogOpen(false);
      }
      console.log("[MOCK] Conversation ended. ID was:", id);
      return;
    }

    try {
      await conversation.endSession();
      console.log("Conversation ended. ID was:", id);
    } catch (e) {
      console.error("Error ending session:", e);
    }

    if (id) {
      try {
        setIsAssessing(true);
        setAssessmentError(null);
        const resp = await fetch("/api/assessment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: id }),
        });

        if (!resp.ok) {
          const errJson = await resp.json().catch(() => ({}));
          const message = (errJson && errJson.message) || `Server error ${resp.status}`;
          throw new Error(message);
        }

        const json = await resp.json();
        setAssessment(json.assessment ?? null);
        if (json.assessment) {
          setIsAssessmentDialogOpen(true);
        }
      } catch (e: any) {
        console.error("Assessment failed", e);
        setAssessmentError(e?.message ?? "Assessment failed");
      } finally {
        setIsAssessing(false);
        setConversationId(null);
        conversationIdRef.current = null;
      }
    } else {
      setConversationId(null);
      conversationIdRef.current = null;
      setIsAssessmentDialogOpen(false);
    }
  };

  // Use effect to disconnect agent when component dismounts
  useEffect(() => {
    return () => {
      if (MOCK_VOICE_AGENT) {
        if (speakingIntervalRef.current) window.clearInterval(speakingIntervalRef.current);
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

  const isConnected = () => (MOCK_VOICE_AGENT ? isConnectedMock : conversation.status === "connected");
  const isConnecting = () => (MOCK_VOICE_AGENT ? false : conversation.status === "connecting");

  // For UI
  const getAgentStateText = () => {
    if (MOCK_VOICE_AGENT) {
      if (isConnectedMock) return isSpeakingMock ? "Agent is speaking" : "Listening...";
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
      <div className="shadcn-card rounded-xl border bg-card border-card-border text-card-foreground shadow-sm p-8 max-w-md w-full">
        <h2 className="text-xl font-semibold" data-testid="text-patient-name">
          Voice Consultation with {patientName}
        </h2>
        <p className="text-sm text-muted-foreground">
          Click the phone button to begin the voice consultation
        </p>
      </div>

        <Card className="p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-48 h-48" data-testid="agent-state-indicator">
              <div className="absolute inset-0 bg-muted rounded-full p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
                <div className="relative w-full h-full bg-background rounded-full shadow-[inset_0_0_12px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_12px_rgba(0,0,0,0.3)]" style={{ overflow: 'hidden' }}>
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
              <p className="text-xs text-muted-foreground" data-testid="text-conversation-id">
                Conversation ID: {conversationId.substring(0, 8)}...
              </p>
            )}

            {isAssessing && (
              <p className="text-xs text-muted-foreground" data-testid="text-assessing">
                Assessing conversation...
              </p>
            )}

            {assessmentError && (
              <p className="text-xs text-destructive" data-testid="text-assessment-error">
                {assessmentError}
              </p>
            )}

            {assessment && (
              <div className="w-full text-sm text-foreground" data-testid="text-assessment">
                {assessment}
              </div>
            )}

          </div>
        </Card>

        <Dialog open={isAssessmentDialogOpen} onOpenChange={setIsAssessmentDialogOpen}>
          <DialogContent className="sm:max-w-xl" data-testid="assessment-dialog">
            <DialogHeader>
              <DialogTitle>Consultation Assessment</DialogTitle>
              <DialogDescription>
                Summary of the conversation and feedback.
              </DialogDescription>
            </DialogHeader>
            <div
              className="max-h-[60vh] overflow-auto whitespace-pre-wrap text-sm text-foreground"
              data-testid="assessment-dialog-content"
            >
              {assessment}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Card className="bg-accent/30 border-accent">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="w-4 h-4 text-primary" />
              Tip: Feedback Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground">Auto-detect:</span>
                <span>When you close the consult (e.g., say "Goodbye"/end the case), feedback starts automatically.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-foreground">Manual trigger:</span>
                <span>If it doesn't start, say "FEEDBACK MODE".</span>
              </li>
              <li className="flex items-start gap-2">
                <span>You'll get structured feedback on: history, reasoning/safety, empathy/communication, ICE coverage, clarity (jargon check), and practicalities (leaflets/referrals).</span>
              </li>
            </ul>
          </CardContent>
        </Card>

    </div>
  );
}

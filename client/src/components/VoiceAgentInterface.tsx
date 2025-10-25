import { useState, useEffect, useRef } from "react";
import { useConversation } from "@elevenlabs/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Orb, AgentState } from "@/components/ui/orb";
import { Phone, PhoneOff } from "lucide-react";

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
    try {
      const id = await conversation.startSession({
        agentId: agentId,
        connectionType: "websocket" as const,
        userId: "fixed-user-12345",
        clientTools: {},
      });
      setConversationId(id);
      conversationIdRef.current = id;
      console.log("Conversation started with ID:", id, "User ID: fixed-user-12345");
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  };

  const handleEndConversation = () => {
    conversation.endSession();
    console.log("Conversation ended. ID was:", conversationIdRef.current);
    setConversationId(null);
    conversationIdRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (conversation.status === "connected") {
        conversation.endSession();
      }
    };
  }, []);

  const getAgentState = (): AgentState => {
    if (conversation.status !== "connected") return null;
    if (conversation.isSpeaking) return "talking";
    return "listening";
  };

  const getAgentStateText = () => {
    if (conversation.status === "connecting") return "Connecting...";
    if (conversation.status === "connected") {
      if (conversation.isSpeaking) return "Agent is speaking";
      return "Listening...";
    }
    return "Ready to start";
  };

  const getInputVolume = () => {
    const raw = conversation.getInputVolume?.() ?? 0;
    return Math.min(1.0, Math.pow(raw, 0.5) * 2.5);
  };

  const getOutputVolume = () => {
    const raw = conversation.getOutputVolume?.() ?? 0;
    return Math.min(1.0, Math.pow(raw, 0.5) * 2.5);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 bg-card">
        <h2 className="text-xl font-semibold" data-testid="text-patient-name">
          Voice Consultation with {patientName}
        </h2>
        <p className="text-sm text-muted-foreground">
          Click the phone button to begin the voice consultation
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
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
                {conversation.status === "connected" 
                  ? "Speak naturally to communicate with the patient"
                  : "Press the phone button to start"}
              </p>
            </div>

            <div className="flex gap-4">
              {conversation.status !== "connected" ? (
                <Button
                  onClick={handleStartConversation}
                  size="lg"
                  className="rounded-full w-16 h-16"
                  disabled={conversation.status === "connecting"}
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
          </div>
        </Card>
      </div>
    </div>
  );
}

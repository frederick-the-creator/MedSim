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
  const [transcript, setTranscript] = useState<string | null>(null);
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
    setTranscript(null);
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
                        const mockTranscript = `"transcript": "User: Hello, Ms. O'Connor. I'm Eliana de Mondon, an SD1 registrar here in the I Department, and I'd just like to go through quickly what brought you here and then explain what we think the impression is.\nAgent: <Aoife>Hi—thanks. My right eye hurts a lot and I’m...\nUser: Hi, thanks.\nAgent: <Aoife>Hi… thanks for seeing me. My right eye is really sore and I’m getting quite anxious about it.</Aoife>\nUser: Okay, can you tell me more about it? Like, when did this all start?\nAgent: <Aoife>Yesterday evening, and it’s definitely worse this morning. I didn’t sleep well with it.</Aoife>\nUser: I see, okay. It seems like you're really going through a lot. Apart from soreness, is there any redness at all?\nAgent: <Aoife>Very red, yes. It feels hot and sore.</Aoife>\nUser: Any other symptoms such as discharge in your eye, blurring of vision, sensitivity to light?\nAgent: <Aoife>Yes—on that side it’s quite blurred. I can see, just not clearly, and it’s unsettling.</Aoife>\nUser: I see. Are you more sensitive to light as well?\nAgent: <Aoife>Bright light really sets it off. I’m kind of half-closing it to cope.</Aoife>\nUser: And is this the first time that this happened?\nAgent: <Aoife>No, this is new for me.</Aoife>\nUser: I see. And just to clarify, is it just your right eye or is your left eye affected as well now?\nAgent: <Aoife>Just the right—the other one feels normal, thanks.</Aoife>\nUser: Okay, well let's just go through your medical history and your ocular history as well. Do you wear any contact lenses?\nAgent: <Aoife>No, I don’t wear contacts.</Aoife>\nUser: Any previous eye conditions?\nAgent: <Aoife>No, this is new for me.</Aoife>\nUser: Okay any eye surgery or laser done to that eye?\nAgent: <Aoife>No, nothing like that.</Aoife>\nUser: And otherwise are you fit and well?\nAgent: <Aoife>Yes, I'm otherwise healthy.</Aoife>\nUser: I see okay.\nAgent: <Aoife>...</Aoife>\nUser: All right and any trauma to your right eye was there anything that you remember like hit your eye or came onto your eye?\nAgent: <Aoife>No injury I’m aware of. It just started hurting and kept building.</Aoife>\nUser: I see okay and you mentioned that you do not wear any contact lenses.\nAgent: <Aoife>That's right, I don't.</Aoife>\nUser: ...\nAgent: <Aoife>Sorry—I’m trying to focus. The pain makes it hard to think straight.</Aoife>\nUser: I see it seems like you're in a lot of pain well I can give you a paracetamol in the meantime to make you more comfortable. Um all right and just can I ask if you had any recent fever, cough, cold, sore throat?\nAgent: <Aoife>No, nothing else going on that I’ve noticed.</Aoife>\nUser: Okay so on examination of your eye what we did notice was that um we did notice was that in the cornea of your eye which is the front transparent dome-like layer uh there is a defect there that we found um and I think this is what's causing the symptoms so we think basically that there's inflammation and a bit of this defect that's that's uh that's um that's causing your symptoms at the moment\nAgent: <Aoife>Thanks for explaining. I’m just a bit frightened it’s something serious.</Aoife>\nUser: I understand why you'd be frightened about this and I'd just like to say that the good thing is that you came early and that people will help you treat it. So with this defect that you call this, we call this a corneal ulcer and what we'd have to do is basically treat this aggressively initially with antibiotic drops and we also need to scrape the ulcer just to check if there's any virus or any bacteria that's growing and we can taper our management as is.\nAgent: <Aoife>Okay…</Aoife>\nUser: All right. So we'll do the corneal scrape today. Basically, we'll put some numbing drops there so you don't feel a thing. And then we will take some samples of that, send that to the lab. But in the meantime, we will start you on hourly antibiotics called moxifloxacin. As you mentioned, you don't have any allergies. And then we're going to do a little bit of an hourly antibiotic test for you to see if it's working or not working for you. And then we will see you the following day as well.\nAgent: <Aoife>Thanks for explaining. I’m just a bit frightened it’s something serious.</Aoife>\nUser: You mentioned this twice now. Is there anything in specific that you're thinking of that's making you frightened?\nAgent: <Aoife>I’m scared about my sight on that side. I’d really appreciate help to get this sorted.</Aoife>\nUser: I see. Was there any specific condition that you were thinking of?\nAgent: <Aoife>Sorry—I’m trying to focus...\nUser: Was there any specific condition that you were thinking of? Okay, so let's just run through the management again. We'll do a corneal scrape of your eye. We'll give you regular hourly antibiotics and we'll see you in a day and follow up. But before that, let me just run this case with my consultant and I'll give you also a leaflet about corneal ulcers. Do you have any other further questions?\nAgent: <Aoife>No, I don’t think so. Could we go step by step? That would help me stay calm.</Aoife>\nUser: Okay, all right. So as I said earlier, we'll do the corneal scrape, send that to the laboratory. We give you in terms of management, we'll give you drops, antibiotic drops on your right eye that you will have to instill every hour. And I'll also give you a leaflet about this condition and we will see you... We will follow you up closely and see you in about one or two days to see how your eye is getting along with the treatment.\nAgent: <Aoife>Thanks for saying that—it helps.</Aoife>\nUser: Okay. And in the meantime, so while you're waiting for your next appointment with us, if you feel like your symptoms are getting worse, if you have any redness, eye pain, if all your symptoms are getting worse, then by all means, please come back to our A&E.\nAgent: <Aoife>Okay…</Aoife>\nUser: All right, feedback mode, please.\nAgent: Okay, great effort. In history-taking, you quickly identified the laterality of the pain, which was good. Next time, ask early about contact lenses and recent swimming or water exposure, as they change the urgency and differentials. Also, remember to check visual acuity in both eyes with a pinhole. This is important for assessing the severity of the condition and monitoring for any changes.\n\nAn actionable upgrade would be to add after pain and vision, \"Do you wear contact lenses? Any swimming or water in the eye recently?\" That pair screens for microbial or Acanthamoeba keratitis. For safety, you flagged urgency. Strengthen by stating no steroids, arrange same-day ophthalmology, and check visual acuity in both eyes, including using a pinhole.\nUser: Any other feedback?\nAgent: For empathy, you acknowledged her pain once, which was nice. Try signposting, such as, \"I'll ask a few quick questions so we can help your pain faster,\" and then chunk and check after two to three questions. Also, remember to validate her concerns about her sight, as that was a major worry for her. Great effort. Ask early about lenses and water exposure, and verbalize urgent no-steroid management. Ready to practice again?\nUser: Thank you very much.\nAgent: You're welcome! I'm glad I could help. If you have any other questions or want to practice again, feel free to ask.\nUser: Hey Mert, this is wonderful.\nAgent: I'm glad to hear that you found it helpful! Is there anything else I can assist you with?\nUser: No, you've been great thank you. Tested this out.\nAgent: Great to hear! Thanks for testing it out. Have a great day!\nAgent:\nAgent:"`;
                        setAssessment(mockAssessment);
                        setTranscript(mockTranscript);
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
                        setTranscript(json.transcript ?? null);
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

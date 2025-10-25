import { BookOpen, MessageSquare, ClipboardCheck } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: BookOpen,
    title: "Case Library",
    description: "Choose a scenario"
  },
  {
    number: 2,
    icon: MessageSquare,
    title: "Simulated Interview",
    points: [
      "Patient won't volunteer info",
      "Use open questions for ICE",
      "Keep it plain-English"
    ]
  },
  {
    number: 3,
    icon: ClipboardCheck,
    title: "Feedback Mode",
    points: [
      "Auto-starts when you say goodbye",
      "Or say \"FEEDBACK MODE\"",
      "Get structured feedback"
    ]
  }
];

export default function InstructionSteps() {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Instructions</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Pick an agent to begin. The patient reveals details only when asked. Use open questions and explore ideas, concerns, expectations (ICE).
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="flex flex-col items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  {step.number}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className="w-5 h-5 text-primary" />
                    <h3 className="text-2xl font-semibold">{step.title}</h3>
                  </div>
                  {step.description && (
                    <p className="text-base text-foreground">{step.description}</p>
                  )}
                  {step.points && (
                    <ul className="space-y-2 mt-2">
                      {step.points.map((point, idx) => (
                        <li key={idx} className="text-sm leading-relaxed text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

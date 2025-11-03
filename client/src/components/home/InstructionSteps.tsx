import { BookOpen, MessageSquare, ClipboardCheck } from "lucide-react";

const steps = [
	{
		number: 1,
		icon: BookOpen,
		title: "Case Study Library",
		description: "Choose a case from the selection below to start training.",
	},
	{
		number: 2,
		icon: MessageSquare,
		title: "Simulated Interview",
		description: "After selecting a case study, you will be shown the clinical findings and can begin the patient interview."
	},
	{
		number: 3,
		icon: ClipboardCheck,
		title: "Feedback Mode",
		description: "After completing the conversation with the patient, you will be presented with a personalized assessment and strategies for improvement. Use the chat function to dig deeper."
	},
];

export default function InstructionSteps() {
	return (
			<div className="flex flex-col max-w-7xl p-4 align-center mx-auto my-16">
				<div className="text-center mb-12">
					<h2 className="text-4xl font-bold mb-4">OST Interview Trainer</h2>
					<p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
					This tool is designed to help you prepare for the communication and patient-interaction stations for the ophthalmology specialty training interiews. 
					It simulates realistic consultation scenarios where you can practise structuring your approach, using open questions, and demonstrating empathy. 
					The goal is to improve your fluency, confidence, and consistency under interview conditions.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{steps.map((step) => {
						const Icon = step.icon;
						return (
							<div
								key={step.number}
								className="flex flex-col items-start gap-4 p-4"
							>
								<div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
									{step.number}
								</div>
								<div className="flex-1">
									<div className="flex items-center gap-3 mb-3">
										<Icon className="w-5 h-5 text-primary" />
										<h3 className="text-2xl font-semibold">{step.title}</h3>
									</div>
									{step.description && (
										<p className="text-base text-foreground">
											{step.description}
										</p>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>

	);
}

import FeedbackDisplay from "../FeedbackDisplay";
import { ConversationFeedback } from "@shared/schema";

const mockFeedback: ConversationFeedback = {
	overall:
		"Good consultation overall. You demonstrated strong communication skills and showed empathy. However, there's room for improvement in systematically exploring the patient's ideas, concerns, and expectations.",
	sections: [
		{
			category: "History Taking",
			score: 8,
			maxScore: 10,
			comments: ["Thorough exploration of symptoms"],
			strengths: [
				"Asked about onset and duration",
				"Explored exacerbating factors",
			],
			improvements: [
				"Could have asked more about contact lens hygiene habits",
				"Missed opportunity to explore previous eye problems",
			],
		},
		{
			category: "Clinical Reasoning",
			score: 9,
			maxScore: 10,
			comments: ["Excellent diagnostic approach"],
			strengths: [
				"Correctly identified likely bacterial keratitis",
				"Appropriate safety netting advice given",
			],
			improvements: [
				"Could have explained differential diagnosis more clearly",
			],
		},
		{
			category: "Communication & Empathy",
			score: 7,
			maxScore: 10,
			comments: [],
			strengths: [
				"Good use of empathetic language",
				"Acknowledged patient concerns",
			],
			improvements: [
				"Could have paused more to check understanding",
				"Some medical jargon could be simplified",
			],
		},
	],
};

export default function FeedbackDisplayExample() {
	return (
		<div className="max-w-4xl">
			<FeedbackDisplay
				feedback={mockFeedback}
				onNewCase={() => console.log("New case clicked")}
			/>
		</div>
	);
}

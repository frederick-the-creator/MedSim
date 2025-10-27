import { useState } from "react";
import ChatInterface from "../ChatInterface";
import { ChatMessage } from "@shared/schema";

export default function ChatInterfaceExample() {
	const [messages, setMessages] = useState<ChatMessage[]>([
		{
			id: "1",
			role: "user",
			content:
				"Hello, I understand you're having some issues with your eye. Can you tell me what's been happening?",
			timestamp: new Date(),
		},
		{
			id: "2",
			role: "assistant",
			content:
				"Hi doctor. My right eye has been really sore since this morning. It's quite red and watery too.",
			timestamp: new Date(),
		},
	]);

	const handleSend = (message: string) => {
		const newMessage: ChatMessage = {
			id: Date.now().toString(),
			role: "user",
			content: message,
			timestamp: new Date(),
		};
		setMessages([...messages, newMessage]);
		console.log("Sent:", message);
	};

	return (
		<div className="h-[600px] border rounded-lg overflow-hidden">
			<ChatInterface
				patientName="Aoife O'Connor"
				messages={messages}
				onSendMessage={handleSend}
			/>
		</div>
	);
}

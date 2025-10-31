import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { CoachMessage } from "@shared/schemas/coach";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface CoachInterfaceProps {
	messages: CoachMessage[];
	onSendMessage: (message: string) => void;
	isLoading?: boolean;
}

export default function CoachInterface({
	messages,
	onSendMessage,
	isLoading = false,
}: CoachInterfaceProps) {
	const [input, setInput] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleSend = () => {
		if (input.trim() && !isLoading) {
			onSendMessage(input.trim());
			setInput("");
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

		return (
			<div className="flex flex-col h-full min-h-0">
				<div className="border-b bg-card pb-4">
					<h2 className="text-xl font-semibold" data-testid="text-patient-name">
						Explore your assessment with our coaching agent
					</h2>
				</div>

				<div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
					<>
						{messages.map((message) => (
							<div
								key={message.id}
								className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
								data-testid={`message-${message.role}-${message.id}`}
							>
								<div
									className={`max-w-xl rounded-2xl px-4 py-3 ${
										message.role === "user"
											? "bg-primary text-primary-foreground rounded-tr-sm"
											: "bg-card border rounded-tl-sm"
									}`}
								>
									<div
										className={`prose prose-sm max-w-none ${
											message.role === "user" ? "prose-invert" : "dark:prose-invert"
										}`}
									>
										<ReactMarkdown remarkPlugins={[remarkGfm]}>
											{message.content}
										</ReactMarkdown>
									</div>
								</div>
							</div>
						))}
						<div ref={messagesEndRef} />
					</>
				</div>

				<div className="pt-4 border-t">
					<div className="flex gap-2 max-w-3xl mx-auto">
						<Textarea
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Type your message..."
							className="resize-none h-20 max-h-40 overflow-y-auto"
							disabled={isLoading}
							data-testid="input-message"
						/>
						<Button
							onClick={handleSend}
							disabled={!input.trim() || isLoading}
							size="icon"
							className="min-h-[60px] w-[60px]"
							data-testid="button-send"
						>
							<Send className="w-5 h-5" />
						</Button>
					</div>
				</div>
			</div>
	);
}

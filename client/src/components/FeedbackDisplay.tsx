import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	CheckCircle2,
	AlertCircle,
	TrendingUp,
	MessageSquare,
	Heart,
	Brain,
	FileText,
	ClipboardList,
} from "lucide-react";
import { ConversationFeedback } from "@shared/schema";

interface FeedbackDisplayProps {
	feedback: ConversationFeedback;
	onNewCase: () => void;
}

const iconMap: Record<string, any> = {
	"History Taking": ClipboardList,
	"Clinical Reasoning": Brain,
	"Communication & Empathy": Heart,
	"ICE Coverage": MessageSquare,
	"Language Clarity": FileText,
	"Practical Management": TrendingUp,
};

export default function FeedbackDisplay({
	feedback,
	onNewCase,
}: FeedbackDisplayProps) {
	return (
		<div className="h-full overflow-y-auto p-6 space-y-6">
			<div>
				<h2
					className="text-4xl font-bold mb-4"
					data-testid="text-feedback-title"
				>
					Consultation Feedback
				</h2>
				<Card className="bg-accent/30 border-accent">
					<CardContent className="pt-6">
						<p
							className="text-base leading-relaxed"
							data-testid="text-overall-feedback"
						>
							{feedback.overall}
						</p>
					</CardContent>
				</Card>
			</div>

			<div>
				<h3 className="text-2xl font-semibold mb-4">Detailed Feedback</h3>
				<Accordion
					type="multiple"
					defaultValue={feedback.sections.map((_, idx) => `item-${idx}`)}
					className="space-y-4"
				>
					{feedback.sections.map((section, idx) => {
						const Icon = iconMap[section.category] || CheckCircle2;
						const percentage = Math.round(
							(section.score / section.maxScore) * 100,
						);

						return (
							<AccordionItem
								key={idx}
								value={`item-${idx}`}
								className="border rounded-lg"
							>
								<AccordionTrigger
									className="px-4 hover:no-underline hover-elevate rounded-lg"
									data-testid={`accordion-${section.category.toLowerCase().replace(/\s+/g, "-")}`}
								>
									<div className="flex items-center justify-between w-full pr-4">
										<div className="flex items-center gap-3">
											<Icon className="w-5 h-5 text-primary" />
											<span className="font-semibold">{section.category}</span>
										</div>
										<Badge
											variant={
												percentage >= 80
													? "default"
													: percentage >= 60
														? "secondary"
														: "destructive"
											}
											data-testid={`badge-score-${idx}`}
										>
											{section.score}/{section.maxScore}
										</Badge>
									</div>
								</AccordionTrigger>
								<AccordionContent className="px-4 pb-4">
									<div className="space-y-4 pt-2">
										{section.strengths.length > 0 && (
											<div>
												<div className="flex items-center gap-2 mb-2">
													<CheckCircle2 className="w-4 h-4 text-primary" />
													<h4 className="text-sm font-medium">Strengths</h4>
												</div>
												<ul className="space-y-1 ml-6">
													{section.strengths.map((strength, sIdx) => (
														<li
															key={sIdx}
															className="text-sm text-muted-foreground"
														>
															• {strength}
														</li>
													))}
												</ul>
											</div>
										)}

										{section.improvements.length > 0 && (
											<div>
												<div className="flex items-center gap-2 mb-2">
													<AlertCircle className="w-4 h-4 text-destructive" />
													<h4 className="text-sm font-medium">
														Areas for Improvement
													</h4>
												</div>
												<ul className="space-y-1 ml-6">
													{section.improvements.map((improvement, iIdx) => (
														<li
															key={iIdx}
															className="text-sm text-muted-foreground"
														>
															• {improvement}
														</li>
													))}
												</ul>
											</div>
										)}

										{section.comments.length > 0 && (
											<div className="border-t pt-3">
												<h4 className="text-sm font-medium mb-2">Comments</h4>
												<ul className="space-y-1">
													{section.comments.map((comment, cIdx) => (
														<li
															key={cIdx}
															className="text-sm text-muted-foreground"
														>
															{comment}
														</li>
													))}
												</ul>
											</div>
										)}
									</div>
								</AccordionContent>
							</AccordionItem>
						);
					})}
				</Accordion>
			</div>

			<div className="flex gap-4 pt-6 border-t">
				<Button
					onClick={onNewCase}
					className="flex-1"
					data-testid="button-new-case"
				>
					Try Another Case
				</Button>
			</div>
		</div>
	);
}

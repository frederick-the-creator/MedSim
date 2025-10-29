import type { Assessment } from "@shared/schemas/assessment";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

type Props = {
	assessment: Assessment | null;
};

export default function AssessmentCard({ assessment }: Props) {
	if (!assessment) return null;
	const dims = Array.isArray(assessment.dimensions) ? assessment.dimensions : [];
	const hasInsufficient = dims.some((d) => d.insufficient_evidence);
	const hasRedFlags = dims.some(
		(d) => Array.isArray(d.red_flags) && d.red_flags.length > 0,
	);

	return (
		<ScrollArea className="h-[70vh] px-6 pb-6">
			<div className="space-y-4">
				{/* Overview */}
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-lg font-semibold">AI Generated Assessment</h2>
					</div>
					<div className="text-right">
						<div className="flex justify-end gap-2">
							{hasInsufficient && (
								<Badge variant="destructive">Insufficient evidence</Badge>
							)}
							{hasRedFlags && <Badge variant="destructive">Red flags</Badge>}
						</div>
					</div>
				</div>

				{/* Summary */}
				<div className="border rounded p-3 space-y-2">
					<div className="font-medium">Summary</div>
					<p className="text-sm">{assessment.summary.free_text}</p>
					{Array.isArray(assessment.summary.bullet_points) && (
						<ul className="list-disc pl-5 text-sm">
							{assessment.summary.bullet_points.map((x, i) => (
								<li key={i}>{x}</li>
							))}
						</ul>
					)}
				</div>

				{/* Dimensions */}
				<Accordion type="single" collapsible className="w-full">
					{dims.map((d, i) => (
						<AccordionItem key={i} value={`dim-${i}`}>
							<AccordionTrigger>
								<div className="flex items-center justify-between w-full">
									<div className="text-left">
										<div className="font-medium">{d.name}</div>
									</div>
									<div className="flex gap-2">
										{d.insufficient_evidence && (
											<Badge variant="destructive">Insufficient evidence</Badge>
										)}
										{Array.isArray(d.red_flags) && d.red_flags.length > 0 && (
											<Badge variant="destructive">Red flags</Badge>
										)}
									</div>
								</div>
							</AccordionTrigger>
							<AccordionContent>
								<div className="grid md:grid-cols-2 gap-4 pt-2">
									<div>
										<div className="font-medium text-sm mb-1">Strengths</div>
										<ul className="list-disc pl-5 text-sm">
											{(d.points ?? [])
												.filter((p) => p.type === "strength")
												.map((p, j) => (
													<li key={j}>{p.text}</li>
												))}
										</ul>
									</div>
									<div>
										<div className="font-medium text-sm mb-1">Improvements</div>
										<ul className="list-disc pl-5 text-sm">
											{(d.points ?? [])
												.filter((p) => p.type === "improvement")
												.map((p, j) => (
													<li key={j}>{p.text}</li>
												))}
										</ul>
									</div>
								</div>
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</ScrollArea>
	);
}



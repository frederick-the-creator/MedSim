import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Stethoscope, Lightbulb } from "lucide-react";
import { MedicalCase } from "@shared/schemas/case";

interface CaseBriefProps {
	medicalCase: MedicalCase;
}

function humanizeKey(key: string): string {
	const withSpaces = key
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
		.replace(/[_-]+/g, " ")
		.trim();
	return withSpaces
		.split(/\s+/)
		.map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ""))
		.join(" ");
}

export default function CaseBrief({ medicalCase }: CaseBriefProps) {

	const caseVignette = medicalCase.vignette

	return (
		<div className="space-y-3 h-full overflow-y-auto">
			
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-base">
						<FileText className="w-4 h-4 text-primary" />
						Triage Note
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm leading-relaxed" data-testid="text-triage-note">
						{caseVignette.triageNote}
					</p>
				</CardContent>
			</Card>

			<div className="flex justify-center gap-4">
				<Card className="basis-1/2">
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-base">
							<Stethoscope className="w-4 h-4 text-primary" />
							Background
						</CardTitle>
					</CardHeader>
					<CardContent>
						<dl className="space-y-1">
							{Object.entries(caseVignette.background).filter(([key]) => key !== 'scenario').map(([key, value]) => (
								<div key={key} className="border-primary pl-3">
									<dt className="text-xs font-medium inline">{humanizeKey(key)}:</dt>{" "}
									<dd className="text-xs text-muted-foreground inline font-mono">
										{Array.isArray(value) ? value.join(", ") : value}
									</dd>
								</div>
							))}
						</dl>
					</CardContent>
				</Card>

				<Card className="basis-1/2">
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-base">
							<Stethoscope className="w-4 h-4 text-primary" />
							Key Findings
						</CardTitle>
					</CardHeader>
					<CardContent>
						<dl className="space-y-2">
							{Object.entries(caseVignette.keyFindings).map(([key, value]) => (
								<div key={key} className="border-primary pl-3">
									<dt className="text-xs font-medium mb-1">{humanizeKey(key)}</dt>
									{Array.isArray(value) ? (
										<dd className="text-xs text-muted-foreground">
											<ul className="space-y-0.5">
												{value.map((item, idx) => (
													<li key={idx}>• {item}</li>
												))}
											</ul>
										</dd>
									) : (
										<dd className="text-xs text-muted-foreground font-mono">
											{value}
										</dd>
									)}
								</div>
							))}
						</dl>
					</CardContent>
				</Card>

			</div>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-base">
						<Badge
							variant="secondary"
							className="w-6 h-6 rounded-full flex items-center justify-center p-0"
						>
							✓
						</Badge>
						Your Task
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm leading-relaxed" data-testid="text-task">
						{caseVignette.task}
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

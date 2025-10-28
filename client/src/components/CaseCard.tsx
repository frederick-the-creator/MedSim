import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { MedicalCase } from "@shared/schema";

interface CaseCardProps {
	medicalCase: MedicalCase;
	onStart: (caseId: number) => void;
}

export default function CaseCard({ medicalCase, onStart }: CaseCardProps) {

	const caseBackground = medicalCase.vignette.background
	return (
		<Card
			className="hover-elevate transition-shadow duration-200 h-full flex flex-col"
			data-testid={`card-case-${medicalCase.id}`}
		>
			<CardHeader className="space-y-3">
				<div>
					<h3
						className="text-xl font-semibold mb-1"
						data-testid={`text-patient-name-${medicalCase.id}`}
					>
						{caseBackground.patientName}, {caseBackground.age} year old{" "}
						{caseBackground.gender}
					</h3>
				</div>
				<Badge
					variant="secondary"
					className="w-fit uppercase tracking-wide text-xs font-medium"
					data-testid={`badge-clinic-${medicalCase.id}`}
				>
					{caseBackground.clinicType}
				</Badge>
			</CardHeader>

			<CardContent className="flex-1">
				<p
					className="text-sm leading-relaxed text-muted-foreground"
					data-testid={`text-scenario-${medicalCase.id}`}
				>
					{caseBackground.scenario}
				</p>
			</CardContent>

			<CardFooter>
				<Button
					onClick={() => onStart(medicalCase.id)}
					className="w-full gap-2"
					data-testid={`button-start-${medicalCase.id}`}
				>
					Interactive Simulation
					<ArrowRight className="w-4 h-4" />
				</Button>
			</CardFooter>
		</Card>
	);
}

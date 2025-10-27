import { useLocation } from "wouter";
import Header from "@/components/Header";
import InstructionSteps from "@/components/InstructionSteps";
import CaseCard from "@/components/CaseCard";
import { medicalCases } from "@shared/cases";

export default function Home() {
	const [, setLocation] = useLocation();

	const handleStartCase = (caseId: number) => {
		setLocation(`/case/${caseId}`);
	};

	return (
		<div className="min-h-screen flex flex-col bg-background">
			<Header />

			<main className="flex-1">
				<InstructionSteps />

				<div className="py-12 bg-muted/30">
					<div className="max-w-7xl mx-auto px-4">
						<h2
							className="text-4xl font-bold mb-8 text-center"
							data-testid="text-case-library-title"
						>
							Select a Case Study
						</h2>
						<p className="text-center text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
							Choose a simulation to begin your training session
						</p>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{medicalCases.map((medicalCase) => (
								<CaseCard
									key={medicalCase.id}
									medicalCase={medicalCase}
									onStart={handleStartCase}
								/>
							))}
						</div>
					</div>
				</div>
			</main>

			<footer className="border-t py-8">
				<div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
					<p>MedSim - Medical Communication Training Platform</p>
				</div>
			</footer>
		</div>
	);
}

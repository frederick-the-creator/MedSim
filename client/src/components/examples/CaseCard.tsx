import CaseCard from "../CaseCard";
import { medicalCases } from "@shared/cases";

export default function CaseCardExample() {
	return (
		<div className="p-6 max-w-md">
			<CaseCard
				medicalCase={medicalCases[0]}
				onStart={(id) => console.log("Start case:", id)}
			/>
		</div>
	);
}

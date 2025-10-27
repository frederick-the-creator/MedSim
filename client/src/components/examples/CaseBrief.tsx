import CaseBrief from "../CaseBrief";
import { medicalCases } from "@shared/cases";

export default function CaseBriefExample() {
	return (
		<div className="max-w-4xl">
			<CaseBrief medicalCase={medicalCases[0]} />
		</div>
	);
}

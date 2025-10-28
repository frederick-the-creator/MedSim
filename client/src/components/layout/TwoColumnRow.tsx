import { ReactNode } from "react";

interface TwoColumnRowProps {
	left: ReactNode;
	right: ReactNode;
	className?: string;
	/**
	 * Controls the split between left and right columns on large screens.
	 * "2-1" keeps the existing 2fr/1fr layout. "1-1" makes it 50/50.
	 */
	split?: "2-1" | "1-1";
}

export default function TwoColumnRow({
	left,
	right,
	className,
	split = "2-1",
}: TwoColumnRowProps) {
	const splitClass = split === "1-1" ? "lg:grid-cols-[1fr_1fr]" : "lg:grid-cols-[2fr_1fr]";
	return (
		<div className={`grid ${splitClass} gap-6 ${className ?? ""}`}>
			<div className="left bg-card border border-border rounded-xl p-4 shadow-card animate-scale-in min-h-0">
				{left}
			</div>
			<div className="right bg-card border border-border rounded-xl p-4 shadow-card animate-scale-in min-h-0">
				{right}
			</div>
		</div>
	);
}

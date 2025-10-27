import { ReactNode } from "react";

interface TwoColumnRowProps {
	left: ReactNode;
	right: ReactNode;
	className?: string;
}

export default function TwoColumnRow({
	left,
	right,
	className,
}: TwoColumnRowProps) {
	return (
		<div className={`grid lg:grid-cols-[2fr_1fr] gap-6 ${className ?? ""}`}>
			<div className="left bg-card border border-border rounded-xl p-6 shadow-card animate-scale-in">
				{left}
			</div>
			<div className="right bg-card border border-border rounded-xl p-6 shadow-card animate-scale-in">
				{right}
			</div>
		</div>
	);
}

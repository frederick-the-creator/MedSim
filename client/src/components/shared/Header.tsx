import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Stethoscope } from "lucide-react";
import type { ReactNode } from "react";

interface HeaderProps {
	showBackButton?: boolean;
	onBack?: () => void;
    rightActions?: ReactNode;
}

export default function Header({
	showBackButton = false,
	onBack,
    rightActions,
}: HeaderProps) {
	return (
		<header className="border-b bg-background sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
				<Link
					href="/"
					className="flex items-center gap-2 hover-elevate px-3 py-2 rounded-md -ml-3"
					data-testid="link-home"
				>
					<Stethoscope className="w-6 h-6 text-primary" />
					<span className="text-xl font-bold">MedSim</span>
				</Link>

                {rightActions ?? (
                    showBackButton ? (
                        <Button
                            variant="ghost"
                            onClick={onBack}
                            className="gap-2"
                            data-testid="button-back"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Cases
                        </Button>
                    ) : null
                )}
			</div>
		</header>
	);
}

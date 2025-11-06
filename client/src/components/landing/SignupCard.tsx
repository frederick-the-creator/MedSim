import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SignupCardProps {
	discipline: string;
	isPrimary: boolean;
	ctaLabel: string;
	onClick: () => void;
}

export default function SignupCard({ discipline, isPrimary, ctaLabel, onClick }: SignupCardProps) {
	return (
		<Card
			className={cn(
				"hover-elevate transition-shadow duration-200 h-full flex flex-col",
				!isPrimary && "opacity-70"
			)}
		>
			<CardHeader className="space-y-2">
				<h3 className="text-lg font-semibold">{discipline}</h3>
			</CardHeader>
			<CardContent className="flex-1">
				<p className="text-sm text-muted-foreground">
					Practice communication and scenario-based preparation tailored to this training pathway.
				</p>
			</CardContent>
			<CardFooter>
				<Button
					variant={isPrimary ? "default" : "secondary"}
					className="w-full"
					onClick={onClick}
					aria-label={`${ctaLabel} for ${discipline}`}
				>
					{ctaLabel}
				</Button>
			</CardFooter>
		</Card>
	);
}



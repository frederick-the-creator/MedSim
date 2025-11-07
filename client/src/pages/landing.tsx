import Header from "@/components/shared/Header";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import SignupCard from "@/components/landing/SignupCard";
import { disciplines } from "@/data/disciplines";
import type { Discipline } from "@/data/disciplines";

export default function Landing() {
    const [, setLocation] = useLocation();
    const handleClick = (d: Discipline) => {
        const q = `?discipline=${encodeURIComponent(d.name)}`;
        setLocation(`/signup${q}`);
    };

    useEffect(() => {
        (async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
                setLocation("/home");
            }
        })();
    }, []);

	return (
		<div className="min-h-screen flex flex-col bg-background">
            <Header
                rightActions={
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" data-testid="button-login" onClick={() => setLocation("/login")}>Log in</Button>
                    </div>
                }
            />

			<main className="flex-1">
				{/* Tagline */}
				<section className="py-16 pb-8">
					<div className="max-w-7xl mx-auto px-4 text-center">
						<h1 className="text-3xl md:text-3xl leading-tight">
							Specialty Interview Trainer
						</h1>
						<h1 className="text-3xl md:text-3xl leading-tight">
							Face the real thing before the real thing
						</h1>
					</div>
				</section>

				{/* Video */}
				<section className="py-16 pt-8">
					<div className="max-w-4xl mx-auto px-4">
						<div className="aspect-video w-full overflow-hidden rounded-lg shadow-sm">
							<iframe
								title="Introduction Video"
								width="560"
								height="315"
								className="w-full h-full"
								src="https://www.youtube.com/embed/FfqW87U5dD8"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
								referrerPolicy="strict-origin-when-cross-origin"
								loading="lazy"
								allowFullScreen
							/>
						</div>
					</div>
				</section>

				{/* Sign up / Register interest grid */}
				<section className="py-16 bg-muted/30">
					<div className="max-w-7xl mx-auto px-4">
						<h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
							Get started
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
                            {disciplines.map((d) => (
								<SignupCard
									key={d.name}
									discipline={d.name}
									ctaLabel={d.ctaLabel}
									isPrimary={d.isPrimary}
                                    onClick={() => handleClick(d)}
								/>
							))}
						</div>
					</div>
				</section>

				{/* FAQ */}
				<section className="py-16">
					<div className="max-w-3xl mx-auto px-4">
						<h2 className="text-3xl font-bold mb-6 text-center">FAQ</h2>
						<Accordion type="single" collapsible>
							<AccordionItem value="item-1">
								<AccordionTrigger>What is MedSim?</AccordionTrigger>
								<AccordionContent>
									MedSim is a medical communication training platform with case-based simulations.
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-2">
								<AccordionTrigger>Who is this for?</AccordionTrigger>
								<AccordionContent>
									Candidates applying to various UK medical training pathways.
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-3">
								<AccordionTrigger>How do I sign up?</AccordionTrigger>
								<AccordionContent>
									Use the relevant card above; sign-up and register interest are coming soon.
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-4">
								<AccordionTrigger>Is this mobile friendly?</AccordionTrigger>
								<AccordionContent>
									Yes. Layout uses responsive containers, grids, and accessible controls.
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</div>
				</section>
			</main>

			<footer className="border-t py-8">
				<div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
					<p>MedSim - Medical Communication Training Platform</p>
				</div>
			</footer>
		</div>
	);
}



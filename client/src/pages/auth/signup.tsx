import { useMemo, useState } from "react";
import Header from "@/components/shared/Header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useLocation } from "wouter";
import { disciplines as disciplinesData } from "@/data/disciplines";

export default function Signup() {
    const [, setLocation] = useLocation();
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const initialDiscipline = (() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const preset = params.get("discipline") || "";
            return disciplinesData.some((d) => d.name === preset) ? preset : "";
        } catch {
            return "";
        }
    })();
    const [discipline] = useState(initialDiscipline);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const disciplineOptions = useMemo(() => disciplinesData.map((d) => d.name), []);

    // discipline is preselected from the URL if present and valid

    const isOphthalmologySelected = (() => {
        const normalized = discipline.trim().toLowerCase();
        return normalized === "ophthalmology st1" || normalized === "opthalmology st1";
    })();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);
        try {
            const normalized = discipline.trim().toLowerCase();
            const isOphthalmology = normalized === "ophthalmology st1" || normalized === "opthalmology st1";

            if (isOphthalmology) {
                if (!password) {
                    setError("Password is required for Ophthalmology sign up");
                    return;
                }
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
											emailRedirectTo: `${window.location.origin}/home`,
											data: name ? { display_name: name } : undefined,
                    },
                });
                if (signUpError) throw signUpError;

                await supabase.from("profile").insert({
                    user_id: data.user?.id ?? null,
                    name: name || null,
                    email,
                    discipline,
                    source: "signup",
                });

                setSuccess("Check your email to verify your account.");

            } else {
                const { error: insertError } = await supabase.from("profile").insert({
                    name,
                    email,
                    discipline,
                    source: "register_interest",
                });
                if (insertError) throw insertError;
                setSuccess("Thanks! We've registered your interest and will let you know as soon as the specialty trainer is available for your specialty.");
            }
        } catch (err: any) {
            setError(err?.message || "Signup failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1">
                <section className="py-16">
                    <div className="max-w-md mx-auto px-4">
                        {(() => {
                            const normalized = discipline.trim().toLowerCase();
                            const isOphthalmology = normalized === "ophthalmology st1" || normalized === "opthalmology st1";
                            return (
                                <div className="mb-6 text-center">
                                    <h1 className="text-3xl font-bold">
                                        {isOphthalmology ? "Sign Up" : "Register Interest"}
                                    </h1>
                                    {discipline ? (
                                        <p className="text-muted-foreground mt-1">{discipline}</p>
                                    ) : null}
                                </div>
                            );
                        })()}
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            {(() => {
                                const normalized = discipline.trim().toLowerCase();
                                const isOphthalmology = normalized === "ophthalmology st1" || normalized === "opthalmology st1";
                                return isOphthalmology ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                ) : null;
                            })()}
                            {error ? (
                                <p className="text-sm text-destructive" role="alert">
                                    {error}
                                </p>
                            ) : null}
                            {success ? (
                                <p className="text-sm text-green-600" role="status">
                                    {success}
                                </p>
                            ) : null}
                            <Button className="w-full" type="submit" disabled={isSubmitting || !discipline}>
                                {isSubmitting
                                    ? (isOphthalmologySelected ? "Signing up…" : "Submitting…")
                                    : (isOphthalmologySelected ? "Sign up" : "Register Interest")}
                            </Button>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
}



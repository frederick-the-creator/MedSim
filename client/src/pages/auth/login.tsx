import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/shared/Header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

export default function Login() {
    const [, setLocation] = useLocation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (signInError) throw signInError;
            setLocation("/home");
        } catch (err: any) {
            setError(err?.message || "Login failed");
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
                        <h1 className="text-3xl font-bold mb-6 text-center">Log in</h1>
                        <form onSubmit={onSubmit} className="space-y-4">
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
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {error ? (
                                <p className="text-sm text-destructive" role="alert">
                                    {error}
                                </p>
                            ) : null}
                            <Button className="w-full" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Signing in…" : "Sign in"}
                            </Button>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
}



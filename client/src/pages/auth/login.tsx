import { useEffect, useState } from "react";
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
    const [info, setInfo] = useState<string | null>(null);
    const [mode, setMode] = useState<"login" | "request" | "update">("login");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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

    const onSendReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setInfo(null);
        setIsSubmitting(true);
        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/login`,
            });
            if (resetError) throw resetError;
            setInfo("Check your email for a password reset link.");
        } catch (err: any) {
            setError(err?.message || "Failed to send reset email");
        } finally {
            setIsSubmitting(false);
        }
    };

    const onUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setInfo(null);
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setIsSubmitting(true);
        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });
            if (updateError) throw updateError;
            setLocation("/home");
        } catch (err: any) {
            setError(err?.message || "Failed to update password");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const hash = window.location.hash || "";
        const params = new URLSearchParams(window.location.search);
        if (hash.includes("type=recovery") || params.get("type") === "recovery") {
            setMode("update");
        }
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1">
                <section className="py-16">
                    <div className="max-w-md mx-auto px-4">
                        {mode === "login" ? (
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
                                {info ? (
                                    <p className="text-sm text-muted-foreground" role="status">
                                        {info}
                                    </p>
                                ) : null}
                                <div className="flex items-center justify-between gap-2">
                                    <Button className="w-full" type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Signing in…" : "Sign in"}
                                    </Button>
                                </div>
                                <div className="text-center">
                                    <button
                                        type="button"
                                        className="text-sm text-primary hover:underline"
                                        onClick={() => {
                                            setMode("request");
                                            setError(null);
                                            setInfo(null);
                                        }}
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                            </form>
                        ) : null}

                        {mode === "request" ? (
                            <form onSubmit={onSendReset} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reset-email">Email</Label>
                                    <Input
                                        id="reset-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                {error ? (
                                    <p className="text-sm text-destructive" role="alert">
                                        {error}
                                    </p>
                                ) : null}
                                {info ? (
                                    <p className="text-sm text-muted-foreground" role="status">
                                        {info}
                                    </p>
                                ) : null}
                                <div className="flex items-center gap-2">
                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? "Sending…" : "Send reset link"}
                                    </Button>
                                    <Button type="button" variant="ghost" onClick={() => setMode("login")}>Back</Button>
                                </div>
                            </form>
                        ) : null}

                        {mode === "update" ? (
                            <form onSubmit={onUpdatePassword} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New password</Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm password</Label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                {error ? (
                                    <p className="text-sm text-destructive" role="alert">
                                        {error}
                                    </p>
                                ) : null}
                                <Button className="w-full" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Updating…" : "Update password"}
                                </Button>
                            </form>
                        ) : null}
                    </div>
                </section>
            </main>
        </div>
    );
}



"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RegisterForm = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirm) {
            alert("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, contactNumber: phone, password }),
            });

            if (res.ok) {
                alert("Registration successful! Please check your email/console for the verification link.");
                // Clear form?
                // setSubmitted(true);
            } else {
                const err = await res.json();
                alert(err.error || "Registration failed");
            }
        } catch (error) {
            console.error("Register error", error);
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleRegister} className="space-y-4 pt-4">
            <div className="space-y-2">
                <Label htmlFor="reg-name">Full Name</Label>
                <Input
                    id="reg-name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                    id="reg-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="reg-phone">Contact Number</Label>
                <Input
                    id="reg-phone"
                    type="tel"
                    placeholder="082 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <Input
                    id="reg-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                    id="confirm-password"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Creating Account..." : "Register"}
            </Button>
        </form>
    );
};

export default function LoginPage() {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                const data = await res.json();
                login(data.user.id, data.user.email, data.user.role, data.user.name);
            } else {
                const err = await res.json();
                alert(err.error || "Login failed");
            }
        } catch (error) {
            console.error("Login error", error);
            alert("An error occurred during login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center bg-muted/40 py-12">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                    <CardDescription>
                        Enter your email to sign in to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="register">Register</TabsTrigger>
                        </TabsList>
                        <TabsContent value="login">
                            <form onSubmit={handleLogin} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <div className="flex justify-end">
                                        <Link
                                            href="/forgot-password"
                                            className="text-sm font-medium text-primary hover:underline hover:text-primary/80"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                </div>
                                <Button className="w-full" type="submit" disabled={loading}>
                                    {loading ? "Signing in..." : "Sign In"}
                                </Button>
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-muted-foreground mb-2">First time logging in?</p>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href="/activate">Activate Account / Set Password</Link>
                                    </Button>
                                </div>
                                <div className="text-center text-sm text-muted-foreground mt-4">
                                    <p className="text-xs italic">Secure authentication enabled.</p>
                                </div>
                            </form>
                        </TabsContent>
                        <TabsContent value="register">
                            <RegisterForm />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

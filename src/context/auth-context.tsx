"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

type UserRole = "super-admin" | "admin" | "customer" | null;

interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
}

interface AuthContextType {
    user: User | null;
    login: (id: string, email: string, role: UserRole, name?: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for stored user on mount
        const initializeAuth = () => {
            const storedUser = localStorage.getItem("computer-store-user");
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            setIsLoading(false);
        };
        initializeAuth();
    }, []);

    const login = (id: string, email: string, role: UserRole, name?: string) => {
        const newUser = {
            id,
            email,
            name: name || email.split("@")[0],
            role,
        };
        setUser(newUser);
        localStorage.setItem("computer-store-user", JSON.stringify(newUser));

        if (role === "admin" || role === "super-admin") {
            router.push("/admin");
        } else {
            router.push("/dashboard");
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("computer-store-user");
        router.push("/");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

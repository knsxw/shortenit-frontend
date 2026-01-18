"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  loginTime: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem("auth-user");
    const token = localStorage.getItem("auth-token");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user data:", error);
        localStorage.removeItem("auth-user");
        localStorage.removeItem("auth-token");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem("auth-user", JSON.stringify(userData));
    localStorage.setItem("auth-token", token);
    setUser(userData);
    router.push("/");
  };

  const logout = () => {
    localStorage.removeItem("auth-user");
    localStorage.removeItem("auth-token");
    setUser(null);
    router.push("/auth");
  };

  useEffect(() => {
    if (!mounted || isLoading) return;

    if (pathname?.startsWith("/auth")) {
      if (user) {
        // If already logged in and on auth page, redirect to home
        router.push("/");
      }
      return;
    }

    if (!user) {
      router.push("/auth");
    }
  }, [user, isLoading, pathname, router, mounted]);

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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

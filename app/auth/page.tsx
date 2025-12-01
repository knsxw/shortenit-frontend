"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);

    try {
      // Simulate authentication
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Store mock user session
      const mockUser = {
        id: "user-" + Date.now(),
        name: "Khine Khant",
        email: "u6611718@au.edu.com",
        avatar: "K",
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem("auth-user", JSON.stringify(mockUser));
      localStorage.setItem("auth-token", "mock-token-" + Date.now());

      window.location.href = "/";
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth-user");
    localStorage.removeItem("auth-token");
    router.push("/auth");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border border-border">
        <div className="p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center mb-2 text-foreground">
            Welcome to Shortenit
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Sign in to your account to get started
          </p>

          {/* Login Button */}
          <Button
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 mb-4 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <rect
                x="3"
                y="3"
                width="8"
                height="8"
                fill="white"
                opacity="0.7"
              />
              <rect
                x="13"
                y="3"
                width="8"
                height="8"
                fill="white"
                opacity="0.7"
              />
              <rect
                x="3"
                y="13"
                width="8"
                height="8"
                fill="white"
                opacity="0.7"
              />
              <rect
                x="13"
                y="13"
                width="8"
                height="8"
                fill="white"
                opacity="0.7"
              />
            </svg>
            {isLoading ? "Signing in..." : "Sign in with Microsoft"}
          </Button>

          {/* Demo Note */}
          <p className="text-xs text-center text-muted-foreground mt-6 pt-6 border-t border-border">
            This is a demo. Click "Sign in with Microsoft" to continue.
          </p>
        </div>
      </Card>
    </div>
  );
}

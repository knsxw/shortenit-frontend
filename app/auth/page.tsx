"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

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
      const mockToken = "mock-token-" + Date.now();

      login(mockUser, mockToken);
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // This function was unused in the original code or used for testing. 
    // Since this is the login page, handleLogout is not typically needed here unless manual cleanup.
    // The previous implementation had it. I'll remove it as it's not used in the UI.
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
              <path
                d="M1 1H11V11H1V1Z"
                fill="#f25022"
              />
              <path
                d="M13 1H23V11H13V1Z"
                fill="#7fba00"
              />
              <path
                d="M1 13H11V23H1V13Z"
                fill="#00a4ef"
              />
              <path
                d="M13 13H23V23H13V13Z"
                fill="#ffb900"
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

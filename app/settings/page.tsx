"use client";

import TopHeader from "@/components/top-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [email, setEmail] = useState("u6611718@au.edu");
  const [displayName, setDisplayName] = useState("Khine Khant");
  const [saved, setSaved] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <TopHeader />
      <main className="flex-1 overflow-auto bg-background p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-foreground">Settings</h1>

          {/* Account Settings */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Account Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Display Name
                </label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-2"
                  disabled
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2"
                  disabled
                />
              </div>
            </div>
          </Card>

          {/* Appearance Settings */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              Appearance
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Theme
                </label>
                <div className="flex gap-2">
                  {["light", "dark", "system"].map((themeOption) => (
                    <button
                      key={themeOption}
                      onClick={() => setTheme(themeOption)}
                      className={`px-4 py-2 rounded-lg border transition-colors capitalize ${
                        theme === themeOption
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border text-foreground hover:border-primary"
                      }`}
                    >
                      {themeOption}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}

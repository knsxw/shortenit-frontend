"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const handleMicrosoftLogin = () => {
    setIsLoading(true);
    window.location.href = `/oauth2/authorization/microsoft`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans relative overflow-hidden selection:bg-primary/20">
      
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-3/4 h-3/4 bg-primary/5 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-lighten" />
        <div className="absolute bottom-0 right-1/4 w-3/4 h-3/4 bg-blue-500/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-lighten" />
      </div>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Left Column: Hero Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 animate-appear">
            
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              <span>Intelligent Link Management</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Shorten Links, <br className="hidden lg:block" />
              Scale Your Reach.
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              The modern link shortener for brands and creators. 
              Track clicks, analyze data, and manage your links with an intuitive dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button 
                onClick={handleMicrosoftLogin}
                disabled={isLoading}
                size="lg" 
                className="h-14 px-8 text-lg font-semibold rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 active:scale-95"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Get Started Free</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground w-full pt-4">
               <div className="flex items-center gap-2">
                 <CheckCircle2 className="w-4 h-4 text-primary" />
                 <span>Free Forever Plan</span>
               </div>
               <div className="flex items-center gap-2">
                 <CheckCircle2 className="w-4 h-4 text-primary" />
                 <span>Detailed Analytics</span>
               </div>
               <div className="flex items-center gap-2">
                 <CheckCircle2 className="w-4 h-4 text-primary" />
                 <span>Custom Aliases</span>
               </div>
               <div className="flex items-center gap-2">
                 <CheckCircle2 className="w-4 h-4 text-primary" />
                 <span>Secure & Reliable</span>
               </div>
            </div>
          </div>

          {/* Right Column: Visual/Login Card */}
          <div className="relative w-full max-w-md mx-auto lg:max-w-none animate-appear delay-100">
             {/* Decorative Elements */}
             <div className="absolute -top-12 -right-12 w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl" />
             <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />

             <Card className="glass-card overflow-hidden border-white/10 dark:border-white/5 shadow-2xl relative">
                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                
                <div className="p-8 space-y-8">
                   <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-6 transform rotate-3 hover:rotate-6 transition-transform">
                          <span className="text-3xl font-bold text-white">K</span>
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
                      <p className="text-muted-foreground">Sign in to your dashboard</p>
                   </div>

                   <div className="space-y-4">
                      <Button
                        onClick={handleMicrosoftLogin}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full h-14 text-base font-medium relative overflow-hidden group border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50 transition-all"
                      >
                         <div className="absolute inset-y-0 left-4 flex items-center">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M1 1H11V11H1V1Z" fill="#f25022"/>
                              <path d="M13 1H23V11H13V1Z" fill="#7fba00"/>
                              <path d="M1 13H11V23H1V13Z" fill="#00a4ef"/>
                              <path d="M13 13H23V23H13V13Z" fill="#ffb900"/>
                            </svg>
                         </div>
                         <span className="pl-6">Sign in with Microsoft</span>
                      </Button>
                   </div>
                   
                   <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                      </p>
                   </div>
                </div>
                
                {/* Visual Fake Data/Graph at bottom for effect */}
                <div className="bg-muted/30 p-4 border-t border-white/5 flex items-center justify-between gap-4">
                   <div className="flex -space-x-2">
                   </div>
                   <div className="text-xs font-medium text-muted-foreground">
                      Build For AU Students
                   </div>
                </div>
             </Card>
          </div>

        </div>
      </main>
    </div>
  );
}

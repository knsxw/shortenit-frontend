"use client";

import type React from "react";

import { useState, useEffect } from "react";
import TopHeader from "@/components/top-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function Home() {
  const [longUrl, setLongUrl] = useState("");
  const [links, setLinks] = useState<
    Array<{
      id: string;
      longUrl: string;
      shortCode: string;
      shortUrl?: string;
      createdAt: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/urls?page=0&size=5`
      );
      if (response.ok) {
        console.log(response);
        const data = await response.json();
        setLinks(
          data
            .map((link: any) => ({
              id: link.id,
              longUrl: link.originalUrl,
              shortCode: link.shortCode,
              shortUrl: link.shortUrl,
              createdAt: link.createdAt,
            }))
            .reverse()
            .slice(0, 5)
        );
      }
    } catch (error) {
      console.error("Failed to fetch links:", error);
    }
  };

  const generateShortCode = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!longUrl.trim()) {
      setError("Please enter a URL");
      return;
    }

    try {
      new URL(longUrl);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/shorten`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            originalUrl: longUrl,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to shorten URL");
      }

      const data = await response.json();
      const newLink = {
        id: data.id,
        longUrl: data.originalUrl,
        shortCode: data.shortCode,
        shortUrl: data.shortUrl,
        createdAt: data.createdAt,
      };

      setLinks([newLink, ...links]);
      setLongUrl("");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <TopHeader />
      <main className="flex-1 overflow-auto bg-background p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">
              Create a new short link
            </h1>
            <p className="text-muted-foreground text-sm md:text-lg">
              Paste your long URL below and we'll create a short, shareable link
            </p>
          </div>

          {/* Shortener Form */}
          <Card className="p-4 md:p-8 mb-8 shadow-lg border border-border bg-card">
            <form onSubmit={handleShorten} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium">
                  Paste your link
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/very/long/url"
                    value={longUrl}
                    onChange={(e) => setLongUrl(e.target.value)}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 md:px-8 bg-primary hover:bg-primary/90 whitespace-nowrap w-full sm:w-auto"
                  >
                    {isLoading ? "Shortening..." : "Shorten it"}
                  </Button>
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </form>
          </Card>

          {/* Feature Cards */}
          {links.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-6 text-center border border-border bg-card">
                <div className="inline-block p-3 bg-primary/10 rounded-lg mb-4">
                  ⚡
                </div>
                <h3 className="font-semibold mb-2">QR Codes</h3>
                <p className="text-sm text-muted-foreground">
                  Generate QR codes from any short link
                </p>
              </Card>
              <Card className="p-6 text-center border border-border bg-card">
                <div className="inline-block p-3 bg-primary/10 rounded-lg mb-4">
                  📊
                </div>
                <h3 className="font-semibold mb-2">Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Track clicks and engagement metrics
                </p>
              </Card>
            </div>
          )}

          {/* Recent Links */}
          {links.length > 0 && (
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-4">
                Your recent links
              </h2>
              <div className="space-y-2">
                {links.map((link) => (
                  <Card
                    key={link.id}
                    className="p-3 md:p-4 border border-border bg-card"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 min-w-0">
                      <div className="flex-1 min-w-0 w-full">
                        <p className="font-mono text-sm font-semibold text-primary truncate">
                          {link.shortUrl ? (
                            link.shortUrl.replace(/^https?:\/\//, "")
                          ) : (
                            `shortenit.freaks.dev/s/${link.shortCode}`
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {link.longUrl}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            link.shortUrl || `${window.location.origin}/${link.shortCode}`
                          )
                        }
                        className="shrink-0 whitespace-nowrap w-full sm:w-auto"
                      >
                        Copy
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

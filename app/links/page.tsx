"use client";

import { useState, useEffect } from "react";
import TopHeader from "@/components/top-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LinksPage() {
  const [links, setLinks] = useState<
    Array<{
      id: string;
      longUrl: string;
      shortCode: string;
      createdAt: string;
      clicks: number;
    }>
  >([]);

  useEffect(() => {
    const savedLinks = localStorage.getItem("shortenit-links");
    if (savedLinks) {
      setLinks(JSON.parse(savedLinks));
    }
  }, []);

  const handleCopy = (shortCode: string) => {
    navigator.clipboard.writeText(`shortenit.ksx.app/${shortCode}`);
  };

  const handleDelete = (id: string) => {
    const updatedLinks = links.filter((link) => link.id !== id);
    setLinks(updatedLinks);
    localStorage.setItem("shortenit-links", JSON.stringify(updatedLinks));
  };

  return (
    <>
      <TopHeader />
      <main className="flex-1 overflow-auto bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Your Links</h1>

          {links.length === 0 ? (
            <Card className="p-8 md:p-12 text-center border border-border bg-card">
              <p className="text-muted-foreground">
                No links yet. Create one from the home page!
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {links.map((link) => (
                <Card
                  key={link.id}
                  className="p-3 md:p-4 border border-border bg-card"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0 w-full">
                      <p className="font-mono text-sm font-semibold text-primary truncate">
                        shortenit.ksx.app/{link.shortCode}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {link.longUrl}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Clicks: {link.clicks || 0}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(link.shortCode)}
                        className="gap-2 flex-1 sm:flex-initial"
                      >
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(link.id)}
                        className="text-destructive hover:text-destructive shrink-0"
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

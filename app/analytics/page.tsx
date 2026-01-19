"use client";

import { useState, useEffect } from "react";
import TopHeader from "@/components/top-header";
import { Button } from "@/components/ui/button";
import AnalyticsMetrics from "@/components/analytics-metrics";
import ClicksChart from "@/components/clicks-chart";
import LinksTable from "@/components/links-table";
import Link from "next/link";

interface LinkData {
  id: string;
  shortCode: string;
  longUrl: string;
  clicks: number;
  createdAt: string;
  shortUrl?: string;
}

export default function AnalyticsPage() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/urls`
        );
        if (response.ok) {
          const data = await response.json();
          const linksList = Array.isArray(data) ? data : (data?.content || data?.urls || []);
          const enrichedLinks = linksList.map((link: any) => ({
            id: link.id,
            shortCode: link.shortCode,
            longUrl: link.originalUrl,
            clicks: link.clickCount || 0,
            createdAt: link.createdAt,
            shortUrl: link.shortUrl,
          }));

          setLinks(
            enrichedLinks.sort(
              (a: LinkData, b: LinkData) => b.clicks - a.clicks
            )
          );
        }
      } catch (error) {
        console.error("Failed to fetch links:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinks();
  }, []);

  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
  const averageClicks = totalLinks > 0 ? totalClicks / totalLinks : 0;
  const topLink =
    links.length > 0
      ? { shortCode: links[0].shortCode, clicks: links[0].clicks }
      : null;

  return (
    <>
      <TopHeader />
      <main className="flex-1 overflow-auto bg-background py-8 md:py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2 mb-4">
                  ← Back
                </Button>
              </Link>
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
                Analytics
              </h1>
              <p className="text-muted-foreground text-sm md:text-lg mt-2">
                Track the performance of your shortened links
              </p>
            </div>
          </div>

          {!isLoading && (
            <div className="space-y-8">
              <AnalyticsMetrics
                totalLinks={totalLinks}
                totalClicks={totalClicks}
                averageClicks={averageClicks}
                topLink={topLink}
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ClicksChart data={links.slice(0, 10)} />
              </div>

              <LinksTable links={links} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}

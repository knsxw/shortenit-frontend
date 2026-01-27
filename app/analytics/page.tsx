"use client";

import { useState, useEffect, useMemo } from "react";
import TopHeader from "@/components/top-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BarChart3,
  Globe,
  Smartphone,
  MousePointer2,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Link2,
  LayoutGrid,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

interface AnalyticsSummary {
  totalClicks: number;
  lastClickedAt: string | null;
  topCountry: string | null;
  topCountryClicks: number;
  topDeviceType: string | null;
  topDeviceClicks: number;
  clicksToday: number;
  clicksThisWeek: number;
}

interface LinkData {
  id: string;
  shortCode: string;
  originalUrl: string;
  shortUrl: string;
  clickCount: number;
  createdAt: string;
  analyticsSummary: AnalyticsSummary;
}

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#6366f1"];

export default function AnalyticsPage() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const token = localStorage.getItem("auth-token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/urls?page=0&size=1000`,
          {
            headers: {
                "Authorization": token ? `Bearer ${token}` : ""
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          const linksList = Array.isArray(data) ? data : data?.content || data?.urls || [];
          
          setLinks(
            linksList.map((link: any) => ({
              ...link,
              shortUrl: link.shortUrl || `${window.location.origin}/s/${link.shortCode}`,
              // Ensure analyticsSummary exists even if null in API
              analyticsSummary: link.analyticsSummary || {
                totalClicks: link.clickCount || 0,
                lastClickedAt: null,
                topCountry: null,
                topCountryClicks: 0,
                topDeviceType: null,
                topDeviceClicks: 0,
                clicksToday: 0,
                clicksThisWeek: 0,
              },
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinks();
  }, []);

  // Aggregations
  const stats = useMemo(() => {
    const totalClicks = links.reduce((acc, curr) => acc + (curr.clickCount || 0), 0);
    const totalLinks = links.length;
    const avgClicks = totalLinks > 0 ? Math.round(totalClicks / totalLinks) : 0;

    // Device Distribution
    const deviceCounts: Record<string, number> = {};
    links.forEach((link) => {
      const device = link.analyticsSummary.topDeviceType || "Unknown";
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });
    const deviceData = Object.entries(deviceCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // Top Links for Bar Chart
    const topLinks = [...links]
      .sort((a, b) => b.clickCount - a.clickCount)
      .slice(0, 5)
      .map((link) => ({
        name: link.shortCode,
        clicks: link.clickCount,
        url: link.originalUrl,
      }));
      
    // Find absolute top country
    const countryCounts: Record<string, number> = {};
    links.forEach((link) => {
        if(link.analyticsSummary.topCountry) {
            countryCounts[link.analyticsSummary.topCountry] = (countryCounts[link.analyticsSummary.topCountry] || 0) + 1;
        }
    });
    const topCountryEntry = Object.entries(countryCounts).sort((a,b) => b[1] - a[1])[0];
    const topGlobalCountry = topCountryEntry ? topCountryEntry[0] : "N/A";

    return { totalClicks, totalLinks, avgClicks, deviceData, topLinks, topGlobalCountry };
  }, [links]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-3 rounded-lg shadow-xl">
          <p className="font-semibold mb-1">{label}</p>
          <p className="text-sm text-primary">
            {payload[0].value} Clicks
          </p>
          {payload[0].payload.url && (
            <p className="text-xs text-muted-foreground max-w-[200px] truncate mt-1">
              {payload[0].payload.url}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <TopHeader />
      
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">
         {/* Background Gradients */}
         <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/5 blur-[120px] rounded-full" />
          <div className="absolute top-1/2 -left-1/4 w-1/2 h-1/2 bg-blue-500/5 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto space-y-8 animate-appear">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight inline-flex items-center gap-3">
              <LayoutGrid className="w-8 h-8 text-primary" />
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Insights into your link performance and audience engagement.
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="glass-card p-6 rounded-2xl border-primary/10 relative overflow-hidden group hover:border-primary/30 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <MousePointer2 className="w-16 h-16 text-primary" />
              </div>
              <div className="flex flex-col gap-1 relative z-10">
                <span className="text-sm font-medium text-muted-foreground">Total Clicks</span>
                <span className="text-3xl md:text-4xl font-bold">{stats.totalClicks.toLocaleString()}</span>
                <div className="flex items-center text-xs text-green-500 font-medium mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  All time
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6 rounded-2xl border-primary/10 relative overflow-hidden group hover:border-primary/30 transition-all">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Link2 className="w-16 h-16 text-blue-500" />
              </div>
              <div className="flex flex-col gap-1 relative z-10">
                <span className="text-sm font-medium text-muted-foreground">Active Links</span>
                <span className="text-3xl md:text-4xl font-bold">{stats.totalLinks.toLocaleString()}</span>
                <div className="flex items-center text-xs text-blue-500 font-medium mt-1">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  Total created
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6 rounded-2xl border-primary/10 relative overflow-hidden group hover:border-primary/30 transition-all">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BarChart3 className="w-16 h-16 text-purple-500" />
              </div>
              <div className="flex flex-col gap-1 relative z-10">
                <span className="text-sm font-medium text-muted-foreground">Avg. Clicks / Link</span>
                <span className="text-3xl md:text-4xl font-bold">{stats.avgClicks}</span>
                <div className="flex items-center text-xs text-purple-500 font-medium mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Performance
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6 rounded-2xl border-primary/10 relative overflow-hidden group hover:border-primary/30 transition-all">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Globe className="w-16 h-16 text-orange-500" />
              </div>
              <div className="flex flex-col gap-1 relative z-10">
                <span className="text-sm font-medium text-muted-foreground">Top Region</span>
                <span className="text-2xl md:text-3xl font-bold truncate">{stats.topGlobalCountry}</span>
                <div className="flex items-center text-xs text-orange-500 font-medium mt-1">
                  <Globe className="w-3 h-3 mr-1" />
                  Based on volume
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Bar Chart */}
            <Card className="glass-card p-6 rounded-2xl lg:col-span-2 border-primary/10">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="font-semibold text-lg flex items-center gap-2">
                   <BarChart3 className="w-5 h-5 text-primary" />
                   Top 5 Performing Links
                 </h3>
               </div>
               <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={stats.topLinks} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                     <XAxis 
                        dataKey="name" 
                        stroke="currentColor" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        className="text-muted-foreground"
                     />
                     <YAxis 
                        stroke="currentColor" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        allowDecimals={false}
                        className="text-muted-foreground"
                     />
                     <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                     <Bar 
                        dataKey="clicks" 
                        fill="currentColor" 
                        radius={[6, 6, 0, 0]} 
                        className="fill-primary"
                        maxBarSize={60}
                     />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </Card>

            {/* Device Pie Chart */}
            <Card className="glass-card p-6 rounded-2xl border-primary/10">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-semibold text-lg flex items-center gap-2">
                   <Smartphone className="w-5 h-5 text-blue-500" />
                   Devices
                 </h3>
               </div>
               <div className="h-[300px] w-full relative">
                 {stats.deviceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.deviceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                 ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground flex-col gap-2">
                       <Smartphone className="w-8 h-8 opacity-20" />
                       <span className="text-sm">No device data yet</span>
                    </div>
                 )}
               </div>
            </Card>
          </div>

          {/* Detailed Links Table */}
          <Card className="glass-card p-6 rounded-2xl border-primary/10 overflow-hidden">
             <div className="flex items-center justify-between mb-6">
                 <h3 className="font-semibold text-lg flex items-center gap-2">
                   <Link2 className="w-5 h-5 text-green-500" />
                   Detailed Performance
                 </h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="bg-muted/50 text-muted-foreground font-medium uppercase text-xs">
                   <tr>
                     <th className="px-4 py-3 rounded-l-lg">Link</th>
                     <th className="px-4 py-3">Created</th>
                     <th className="px-4 py-3 text-center">Top Device</th>
                     <th className="px-4 py-3 text-center">Top Region</th>
                     <th className="px-4 py-3 text-right rounded-r-lg">Total Clicks</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border/40">
                   {links.map((link) => (
                     <tr key={link.id} className="hover:bg-muted/30 transition-colors group">
                       <td className="px-4 py-3">
                         <div className="flex flex-col">
                           <a href={link.shortUrl} target="_blank" className="font-medium text-primary hover:underline block truncate max-w-[200px]">
                             {link.shortCode}
                           </a>
                           <span className="text-muted-foreground text-xs truncate max-w-[250px]">{link.originalUrl}</span>
                         </div>
                       </td>
                       <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                         <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {new Date(link.createdAt).toLocaleDateString()}
                         </div>
                       </td>
                       <td className="px-4 py-3 text-center">
                         {link.analyticsSummary.topDeviceType ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                                {link.analyticsSummary.topDeviceType}
                            </span>
                         ) : (
                             <span className="text-muted-foreground">-</span>
                         )}
                       </td>
                       <td className="px-4 py-3 text-center">
                          {link.analyticsSummary.topCountry ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500">
                                {link.analyticsSummary.topCountry}
                            </span>
                         ) : (
                             <span className="text-muted-foreground">-</span>
                         )}
                       </td>
                       <td className="px-4 py-3 text-right font-bold">
                         {link.clickCount}
                       </td>
                     </tr>
                   ))}
                   {links.length === 0 && !isLoading && (
                     <tr>
                       <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                         No links available to track.
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

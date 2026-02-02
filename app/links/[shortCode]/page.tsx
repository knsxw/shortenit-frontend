"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, ExternalLink, Calendar, Clock, MousePointer2, Copy, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import TopHeader from "@/components/top-header";

interface LinkDetails {
  id: number;
  originalUrl: string;
  code: string;
  shortUrl: string;
  title: string;
  clickCount: number;
  createdAt: string;
  expiresAt: string | null;
  isActive: boolean;
  codeType: string;
  owner: {
    id: number;
    name: string;
    email: string;
  };
}

export default function LinkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shortCodeParam = params.shortCode as string;

  const [link, setLink] = useState<LinkDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [expirationDays, setExpirationDays] = useState<string>("");
  const [clearExpiration, setClearExpiration] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (shortCodeParam) {
      fetchLinkDetails(shortCodeParam);
    }
  }, [shortCodeParam]);

  const fetchLinkDetails = async (codeToFetch: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("auth-token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/urls/${codeToFetch}`, {
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error("Link not found");
        throw new Error("Failed to load link details");
      }

      const data: LinkDetails = await res.json();
      setLink(data);
      
      // Initialize form defaults
      setTitle(data.title || "");
      setCode(data.code);
      setIsActive(data.isActive);
      setExpirationDays("");
      setClearExpiration(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (link?.shortUrl) {
      navigator.clipboard.writeText(link.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!link) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("auth-token");
      
      const payload: any = {
        title,
        code, // shortCode
        isActive,
      };

      if (clearExpiration) {
        payload.clearExpiration = true;
      } else if (expirationDays) {
        // Ensure expirationDays is a valid number if provided
        const days = parseInt(expirationDays, 10);
        if (!isNaN(days) && days > 0) {
            payload.expirationDays = days;
        }
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/urls/${shortCodeParam}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to update link");
      }

      const updatedLink: LinkDetails = await res.json();
      
      setSuccessMessage("Link updated successfully!");
      setLink(updatedLink);
      
      // If code changed, we might need to update the URL or redirect.
      // Ideally, the user should be redirected to the new URL or the state updated handled.
      if (code !== shortCodeParam) {
           router.replace(`/links/${code}`);
      }
      
      // Clear specific temporary fields
      setExpirationDays("");
      setClearExpiration(false);

    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this link? This action cannot be undone.")) return;
    
    setDeleting(true);
    try {
      const token = localStorage.getItem("auth-token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/urls/${shortCodeParam}`, {
        method: "DELETE",
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (!res.ok) {
        throw new Error("Failed to delete link");
      }

      router.push("/links");
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <TopHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <TopHeader />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <h1 className="text-2xl font-bold mb-4 text-destructive">Error</h1>
          <p className="text-muted-foreground mb-6">{error || "Link not found"}</p>
          <Link href="/links">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Links
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background font-sans">
      <TopHeader />
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/links">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Link Details</h1>
              <p className="text-sm text-muted-foreground">Manage and edit your short link</p>
            </div>
          </div>

          {successMessage && (
            <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center gap-2 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300">
               <Check className="w-4 h-4" />
               {successMessage}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Edit Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration</CardTitle>
                  <CardDescription>Update basic settings for your link.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="Link Title"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Original URL</label>
                      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border text-muted-foreground text-sm break-all">
                        <ExternalLink className="w-4 h-4 shrink-0" />
                        {link.originalUrl}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Short Code (Alias)</label>
                      <div className="flex gap-2">
                         <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md text-muted-foreground text-sm">
                            {new URL(link.shortUrl).origin}/s/
                         </div>
                         <Input 
                           value={code} 
                           onChange={(e) => setCode(e.target.value)} 
                           className="rounded-l-none"
                         />
                      </div>
                      <p className="text-xs text-muted-foreground">Changing this will invalidate the old short link.</p>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <label className="text-sm font-medium">Status</label>
                            <p className="text-xs text-muted-foreground">Enable or disable this link.</p>
                        </div>
                        <Button 
                            type="button" 
                            variant={isActive ? "default" : "secondary"}
                            onClick={() => setIsActive(!isActive)}
                            className={isActive ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                            {isActive ? "Active" : "Inactive"}
                        </Button>
                    </div>

                    <Separator className="my-4" />
                    
                    <div className="space-y-4">
                         <div>
                            <label className="text-sm font-medium mb-1 block">Expiration</label>
                            {link.expiresAt ? (
                                <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400 mb-2">
                                    <Clock className="w-4 h-4" />
                                    Expires on: {new Date(link.expiresAt).toLocaleString()}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <Clock className="w-4 h-4" />
                                    No expiration set (Never expires)
                                </div>
                            )}
                         </div>

                         <div className="flex flex-col gap-2 p-4 bg-muted/30 rounded-lg border">
                             <div className="flex items-center gap-2 mb-2">
                                <input 
                                    type="checkbox" 
                                    id="clearExpected" 
                                    checked={clearExpiration} 
                                    onChange={(e) => setClearExpiration(e.target.checked)}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="clearExpected" className="text-sm font-medium">Remove expiration (Make permanent)</label>
                             </div>
                             
                             {!clearExpiration && (
                                 <div className="flex items-center gap-2">
                                     <Input
                                        type="number"
                                        min="1"
                                        placeholder="Set expires in (days)"
                                        value={expirationDays}
                                        onChange={(e) => setExpirationDays(e.target.value)}
                                        className="max-w-[180px]"
                                     />
                                     <span className="text-sm text-muted-foreground">days from now</span>
                                 </div>
                             )}
                         </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                       <Button type="submit" disabled={saving}>
                         {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                                Saving...
                            </>
                         ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                         )}
                       </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                         <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={handleCopy}
                         >
                            {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                            {copied ? "Copied!" : "Copy Short Link"}
                         </Button>
                         <Link href={`/analytics/${shortCodeParam}`}>
                            <Button variant="outline" className="w-full justify-start">
                                <MousePointer2 className="w-4 h-4 mr-2" />
                                View Analytics
                            </Button>
                         </Link>
                         
                         <Separator />
                         
                         <Button 
                            variant="destructive" 
                            className="w-full justify-start text-destructive-foreground"
                            onClick={handleDelete}
                            disabled={deleting}
                         >
                            {deleting ? "Deleting..." : (
                                <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Link
                                </>
                            )}
                         </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Metadata</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-4">
                        <div className="flex justify-between py-1 border-b border-border/50">
                            <span className="text-muted-foreground">Created</span>
                            <span className="font-medium">{new Date(link.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-border/50">
                            <span className="text-muted-foreground">Clicks</span>
                            <span className="font-medium">{link.clickCount}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-border/50">
                            <span className="text-muted-foreground">Code Type</span>
                            <span className="font-medium">{link.codeType}</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">Owner URL ID</span>
                            <span className="font-medium">{link.id}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

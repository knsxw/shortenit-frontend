"use client";

import { useState, useEffect } from "react";
import TopHeader from "@/components/top-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { useTheme } from "next-themes";
import { Trash2, Copy, Check, Plus, Key } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [saved, setSaved] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // API Keys State
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [expirationDays, setExpirationDays] = useState("30");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [creatingKey, setCreatingKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
        setEmail(user.email);
        setDisplayName(user.name);
        fetchApiKeys();
    }
  }, [user]);

  const fetchApiKeys = async () => {
    setLoadingKeys(true);
    try {
        const token = localStorage.getItem("auth-token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/users/me/api-keys`, {
            headers: {
                "Authorization": token ? `Bearer ${token}` : ""
            }
        });
        if (response.ok) {
            const data = await response.json();
            setApiKeys(Array.isArray(data) ? data : []);
        }
    } catch (error) {
        console.error("Failed to fetch API keys", error);
    } finally {
        setLoadingKeys(false);
    }
  };

  const createApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    setCreatingKey(true);
    setCreatedKey(null);

    try {
        const token = localStorage.getItem("auth-token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/users/me/api-keys`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : ""
            },
            body: JSON.stringify({
                name: newKeyName,
                expirationDays: parseInt(expirationDays) || 30
            })
        });

        if (response.ok) {
            const data = await response.json();
            // Assuming the backend returns the full key only on creation as 'key' or 'token' field
            setCreatedKey(data.key || data.token || "Key created (refresh to see details)"); 
            setNewKeyName("");
            fetchApiKeys();
        }
    } catch (error) {
        console.error("Failed to create API key", error);
    } finally {
        setCreatingKey(false);
    }
  };

  const deleteApiKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) return;

    try {
        const token = localStorage.getItem("auth-token");
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/users/me/api-keys/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": token ? `Bearer ${token}` : ""
            }
        });
        setApiKeys(apiKeys.filter(k => k.id !== id));
    } catch (error) {
        console.error("Failed to delete API key", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <TopHeader />
      <main className="flex-1 overflow-auto bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold mb-8 text-foreground">Settings</h1>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Account Settings */}
            <Card className="p-6">
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

          {/* API Keys Management */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Key className="w-5 h-5 text-primary" />
                        API Keys
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage API keys to access the ShortenIt API programmatically.
                    </p>
                </div>
            </div>

            {/* Create New Key */}
            <div className="bg-muted/30 p-4 rounded-lg border border-border mb-6">
                <h3 className="text-sm font-medium mb-3">Generate New Key</h3>
                <form onSubmit={createApiKey} className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="text-xs text-muted-foreground mb-1 block">Key Name</label>
                        <Input 
                            placeholder="e.g. My CLI Script" 
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            className="bg-background"
                        />
                    </div>
                    <div className="w-full sm:w-32">
                         <label className="text-xs text-muted-foreground mb-1 block">Expires (Days)</label>
                         <Input 
                            type="number"
                            min="1"
                            value={expirationDays}
                            onChange={(e) => setExpirationDays(e.target.value)}
                            className="bg-background"
                        />
                    </div>
                    <Button type="submit" disabled={creatingKey || !newKeyName.trim()}>
                        {creatingKey ? (
                             <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Plus className="w-4 h-4 mr-2" />
                                Generate
                            </>
                        )}
                    </Button>
                </form>
            </div>

            {/* Display Created Key */}
            {createdKey && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">New API Key Generated</span>
                        <span className="text-xs text-muted-foreground">Make sure to copy it now. You won't see it again!</span>
                    </div>
                    <div className="flex items-center gap-2 bg-background border border-border p-2 rounded relative group">
                        <code className="flex-1 font-mono text-sm break-all">{createdKey}</code>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => copyToClipboard(createdKey)}
                        >
                           {copiedKey ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            )}

            {/* Keys List */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium">Your API Keys</h3>
                {loadingKeys ? (
                    <div className="text-center py-8 text-muted-foreground">Loading keys...</div>
                ) : apiKeys.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                        No API keys found. Generate one to get started.
                    </div>
                ) : (
                    <div className="border rounded-lg divide-y">
                        {apiKeys.map((key) => (
                            <div key={key.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{key.name}</span>
                                        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
                                            {key.prefix}
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1 space-x-3">
                                        <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                                        {key.lastUsedAt && <span>Used: {new Date(key.lastUsedAt).toLocaleDateString()}</span>}
                                        {key.expiresAt && <span>Expires: {new Date(key.expiresAt).toLocaleDateString()}</span>}
                                    </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                    onClick={() => deleteApiKey(key.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}

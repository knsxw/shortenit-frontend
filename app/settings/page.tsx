"use client";

import { useState, useEffect } from "react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { useTheme } from "next-themes";
import { Trash2, Copy, Check, Plus, Key, Eye, EyeOff } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  maskedKey: string;
  value?: string; // Full key value if available/stored
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
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [creatingKey, setCreatingKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

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
            const mappedKeys = (Array.isArray(data) ? data : []).map((k: any) => ({
                id: k.id.toString(), // Ensure string for consistency
                name: k.name,
                maskedKey: k.maskedKey || "wk_...****",
                value: k.apiKey || k.key || k.token, // Try multiple fields for full key
                createdAt: k.createdAt,
                expiresAt: k.expiresAt,
                lastUsedAt: k.lastUsedAt
            }));
            setApiKeys(mappedKeys);
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
            
            const newKey: ApiKey = {
                id: (data.id || Date.now()).toString(),
                name: newKeyName,
                maskedKey: data.maskedKey || "wk_...****",
                value: data.apiKey || data.key || data.token, 
                createdAt: new Date().toISOString(),
                expiresAt: expirationDays ? new Date(Date.now() + parseInt(expirationDays) * 86400000).toISOString() : null,
                lastUsedAt: null
            };

            setApiKeys([newKey, ...apiKeys]);
            setNewKeyName("");
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

  const toggleReveal = (id: string) => {
    const newRevealed = new Set(revealedKeys);
    if (newRevealed.has(id)) {
        newRevealed.delete(id);
    } else {
        newRevealed.add(id);
    }
    setRevealedKeys(newRevealed);
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <main className="flex-1 overflow-auto bg-background p-4 md:p-8">
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
                            <div key={key.id} className="p-4 flex flex-col gap-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium">{key.name}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground space-x-3">
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
                                
                                {/* Key Value Display */}
                                <div className="flex items-center gap-2 bg-muted/30 border border-border p-2 rounded relative group">
                                    <code className="flex-1 font-mono text-xs sm:text-sm break-all text-muted-foreground">
                                        {revealedKeys.has(key.id) 
                                            ? (key.value || "Hidden by server") 
                                            : (key.value ? "•".repeat(key.value.length) : key.maskedKey)
                                        }
                                    </code>
                                    <div className="flex items-center gap-1">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                            onClick={() => toggleReveal(key.id)}
                                            title={revealedKeys.has(key.id) ? "Hide key" : "Reveal key"}
                                        >
                                           {revealedKeys.has(key.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                        </Button>
                                        
                                        {/* Show Copy button if we have a value OR if user wants to copy what is likely masked? 
                                            Usually only useful to copy the real value. 
                                            If we don't have the value, copying the mask is useless. 
                                            Only show copy if we have value.
                                        */}
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                            onClick={() => copyToClipboard(key.value || "")}
                                            title="Copy key"
                                        >
                                            {copiedKey ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                        </Button>
                                    </div>
                                </div>
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

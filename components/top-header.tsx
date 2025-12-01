"use client";

import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, LogOut } from "lucide-react";

export default function TopHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  if (!user) return null;

  const userInitial = user.name.charAt(0).toUpperCase();

  return (
    <header className="bg-background border-b border-border px-6 py-4 flex items-center justify-between">
      {/* Left - Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10 bg-muted border-border"
          />
        </div>
      </div>

      {/* Right - Actions & Profile */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {userInitial}
            </div>
            <span className="text-sm font-medium text-foreground">
              {user.name}
            </span>
            <span className="text-lg">▼</span>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-background rounded-lg shadow-lg border border-border z-50">
              <div className="p-3 border-b border-border">
                <p className="text-sm font-medium text-foreground">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-muted transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

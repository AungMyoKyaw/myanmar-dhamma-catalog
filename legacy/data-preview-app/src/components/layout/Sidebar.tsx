"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Search, Users, FolderOpen, ShieldCheck } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Browse", href: "/browse", icon: FolderOpen },
  { name: "Search", href: "/search", icon: Search },
  { name: "Speakers", href: "/speakers", icon: Users },
  { name: "Categories", href: "/categories", icon: FolderOpen },
  { name: "Quality", href: "/quality", icon: ShieldCheck }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-64 bg-background border-r">
      <div className="p-6">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

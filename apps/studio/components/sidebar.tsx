"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Database,
  Images,
  LayoutDashboard,
  ListChecks,
  PenSquare,
  Settings,
  Share2,
} from "lucide-react";
import { cn } from "./ui/button";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/compose", label: "Compose", icon: PenSquare },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/queue", label: "Queue", icon: ListChecks },
  { href: "/accounts", label: "Accounts", icon: Share2 },
  { href: "/media", label: "Media", icon: Images },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ appName = "Centum Studio" }: { appName?: string }) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-[240px] shrink-0 border-r border-line bg-white md:block">
      <div className="flex h-16 items-center gap-2.5 border-b border-line px-5">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-[13px] font-bold text-white">CS</span>
        <span className="text-[15px] font-semibold tracking-[-0.01em]">{appName}</span>
      </div>
      <nav className="flex flex-col gap-0.5 p-3">
        {links.map((link) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
                active ? "bg-brand-soft text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-ink",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mx-3 mt-2 rounded-lg border border-line bg-canvas px-3 py-2.5">
        <p className="flex items-center gap-1.5 text-[12px] font-medium text-muted">
          <Database className="h-3.5 w-3.5" /> Phase 1 · Sprint 1
        </p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-slate-500">
          Human app first. The agent API arrives in Phase 2 on the same code paths.
        </p>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Images,
  LayoutDashboard,
  ListChecks,
  PenSquare,
  Settings,
  Share2,
} from "lucide-react";
import { cn } from "./ui/button";

const GROUPS: { label: string; items: { href: string; label: string; icon: typeof LayoutDashboard; badgeKey?: "review" | "queue" }[] }[] = [
  {
    label: "Plan",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/calendar", label: "Calendar", icon: CalendarDays },
      { href: "/queue", label: "Queue", icon: ListChecks, badgeKey: "queue" },
    ],
  },
  {
    label: "Create",
    items: [
      { href: "/compose", label: "Compose", icon: PenSquare },
      { href: "/media", label: "Media box", icon: Images },
    ],
  },
  {
    label: "Set up",
    items: [
      { href: "/accounts", label: "Accounts", icon: Share2 },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

/** Counts come from the layout, so the shell never queries the database itself. */
export function Sidebar({ counts }: { counts?: { review: number; queue: number } }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[236px] shrink-0 border-r border-line bg-white lg:block">
      <div className="flex h-16 items-center gap-2 border-b border-line px-5">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-[13px] font-bold text-white">CS</span>
        <div className="leading-tight">
          <p className="text-[13.5px] font-semibold text-ink">Centum Studio</p>
          <p className="text-[11px] text-muted">Instagram &amp; YouTube</p>
        </div>
      </div>

      <nav className="flex flex-col gap-5 px-3 py-4">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-2 pb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">{group.label}</p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                const count = item.badgeKey === "review" ? counts?.review : item.badgeKey === "queue" ? counts?.queue : 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                      active ? "bg-brand-soft text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-ink",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {count && count > 0 ? (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold leading-4",
                          item.badgeKey === "review" ? "bg-amber-100 text-amber-800" : "bg-indigo-100 text-indigo-700",
                        )}
                      >
                        {count}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mx-3 mt-2 rounded-xl border border-dashed border-line px-3 py-3">
        <p className="text-[11.5px] font-medium text-ink">Phase 2 preview</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
          Agents will drop posts into this same queue — via REST, MCP, Notion or a Drive folder. No new app to learn.
        </p>
      </div>
    </aside>
  );
}

/** Mobile: a horizontal scroll strip, since the sidebar is hidden under lg. */
export function MobileNav({ counts }: { counts?: { review: number; queue: number } }) {
  const pathname = usePathname();
  const items = GROUPS.flatMap((group) => group.items);

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-line bg-white px-3 py-2 lg:hidden">
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const count = item.badgeKey === "review" ? counts?.review : item.badgeKey === "queue" ? counts?.queue : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium",
              active ? "bg-brand-soft text-indigo-700" : "text-slate-600",
            )}
          >
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
            {count && count > 0 ? (
              <span className="rounded-full bg-amber-100 px-1.5 text-[10.5px] font-semibold text-amber-800">{count}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

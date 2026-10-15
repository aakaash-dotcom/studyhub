"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, Home } from "lucide-react";
import { cn } from "./ui/button";

/**
 * Back button + breadcrumbs.
 *
 * A screen-per-task app needs a way back that is not the browser's — especially
 * from a filtered queue or a single post. `router.back()` follows the session's
 * actual history, and when there is no history (a deep link, a fresh tab) it
 * falls back to the parent screen instead of doing nothing.
 */

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/compose": "Compose",
  "/calendar": "Calendar",
  "/queue": "Queue",
  "/accounts": "Accounts",
  "/media": "Media box",
  "/settings": "Settings",
};

function trail(pathname: string): { href: string; label: string }[] {
  const cleaned = pathname.split("?")[0] ?? "/";
  return [{ href: "/", label: "Dashboard" }, ...(cleaned === "/" ? [] : [{ href: cleaned, label: TITLES[cleaned] ?? "Page" }])];
}

export function BackButton({ fallbackHref = "/" }: { fallbackHref?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const atHome = pathname === "/";

  return (
    <button
      type="button"
      onClick={() => {
        // history.length is 1 on a deep link; going "back" there would leave the
        // app entirely, so send people up the tree instead.
        if (typeof window !== "undefined" && window.history.length > 1 && !atHome) router.back();
        else router.push(fallbackHref);
      }}
      className={cn(
        "inline-flex h-8 items-center gap-1 rounded-lg border border-line bg-white px-2.5 text-[13px] font-medium text-ink transition-colors",
        "hover:bg-slate-50 disabled:opacity-40",
      )}
      disabled={atHome}
      title={atHome ? "You are on the dashboard" : "Back"}
    >
      <ChevronLeft className="h-3.5 w-3.5" />
      Back
    </button>
  );
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const crumbs = trail(pathname);

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[12.5px]">
      {crumbs.map((crumb, index) => {
        const last = index === crumbs.length - 1;
        return (
          <span key={crumb.href} className="flex min-w-0 items-center gap-1.5">
            {index > 0 ? <span className="text-slate-300">/</span> : null}
            {last ? (
              <span className="truncate font-medium text-ink">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="inline-flex items-center gap-1 text-muted transition-colors hover:text-brand">
                {index === 0 ? <Home className="h-3 w-3" /> : null}
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

import Link from "next/link";
import { Plus, Radio, Settings } from "lucide-react";
import { env } from "@centum/core";
import { BackButton, Breadcrumbs } from "./nav-actions";
import { Badge } from "./ui/badge";
import { buttonClass } from "./ui/button";

/**
 * The bar carries the three things that should always be one click away: a way
 * back, where you are, and "write a post". The publishing mode is here too,
 * because whether a post really goes out is the one piece of context worth
 * losing a row of pixels for.
 */
export function Topbar() {
  const live = env().PROVIDER_MODE === "live";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-white/95 px-5 backdrop-blur">
      <BackButton />
      <div className="min-w-0 flex-1">
        <Breadcrumbs />
      </div>
      <Badge tone={live ? "success" : "info"} className="hidden md:inline-flex">
        <Radio className="h-3 w-3" />
        {live ? "Live publishing" : "Mock publishers"}
      </Badge>
      <Link href="/settings" className={buttonClass("secondary", "sm")} title="Settings">
        <Settings className="h-3.5 w-3.5" />
        <span className="hidden lg:inline">Settings</span>
      </Link>
      <Link href="/compose" className={buttonClass("primary", "sm")}>
        <Plus className="h-3.5 w-3.5" />
        New post
      </Link>
    </header>
  );
}

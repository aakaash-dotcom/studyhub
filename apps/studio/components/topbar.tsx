import Link from "next/link";
import { Radio, Settings } from "lucide-react";
import { env } from "@centum/core";
import { Badge } from "./ui/badge";
import { buttonClass } from "./ui/button";

/**
 * No account switcher and no sign-out: this studio belongs to one operator and
 * opens straight onto the work. What the bar carries instead is the thing that
 * actually changes behaviour — whether publishing goes to real platforms.
 */
export function Topbar() {
  const mode = env().PROVIDER_MODE;
  const live = mode === "live";

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-line bg-white px-5">
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-ink">Centum Studio</p>
        <p className="hidden text-[11.5px] text-muted sm:block">
          Instagram &amp; YouTube for the tuition centre, Centum App and the funnel pages.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Badge tone={live ? "success" : "info"}>
          <Radio className="h-3 w-3" />
          {live ? "Live publishing" : "Mock publishers (safe mode)"}
        </Badge>
        <Link href="/settings" className={buttonClass("secondary", "sm")} title="Settings">
          <Settings className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Settings</span>
        </Link>
      </div>
    </header>
  );
}

import { LogOut, Radio } from "lucide-react";
import { env } from "@centum/core";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import type { SessionUser } from "@centum/core";

export function Topbar({ user }: { user: SessionUser }) {
  const mode = env().PROVIDER_MODE;
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-line bg-white px-5">
      <div className="flex items-center gap-2.5 md:hidden">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-[13px] font-bold text-white">CS</span>
        <span className="text-[15px] font-semibold">Centum Studio</span>
      </div>
      <div className="hidden items-center gap-2 md:flex">
        <Badge tone={mode === "live" ? "success" : "info"}>
          <Radio className="h-3 w-3" />
          {mode === "live" ? "Live publishers" : "Mock publishers (safe mode)"}
        </Badge>
        <span className="text-[12px] text-muted">
          {mode === "live" ? "Real Instagram / YouTube APIs" : "Nothing is posted to a real account yet"}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right leading-tight">
          <p className="text-[13px] font-medium text-ink">{user.name || user.email}</p>
          <p className="text-[11.5px] text-muted">{user.email}</p>
        </div>
        <form action="/api/auth/logout" method="POST">
          <Button variant="secondary" size="sm" type="submit" title="Sign out">
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { listBrands, listSafeAccounts } from "@centum/core";
import { ComposeForm } from "@/components/compose-form";
import { buttonClass } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { istInputValue } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ComposePage() {
  const [brands, accounts] = await Promise.all([listBrands(), listSafeAccounts()]);
  // Default to tomorrow evening's posting window (8pm IST) — right for school audiences.
  const defaultWhen = new Date(Date.now() + 24 * 3600 * 1000);
  defaultWhen.setHours(20, 0, 0, 0);

  if (!brands.length) {
    return (
      <>
        <PageHeader title="Compose" description="Create a post for one or many accounts." />
        <div className="card px-6 py-10 text-center">
          <BookOpen className="mx-auto h-6 w-6 text-slate-400" />
          <h2 className="mt-2 text-[15px] font-semibold">No brands yet</h2>
          <p className="mx-auto mt-1 max-w-md text-[13px] text-muted">
            Brands hold the tone, hashtag sets and funnel link for each page. Create your first one in Settings.
          </p>
          <Link href="/settings" className={buttonClass("primary", "md", "mt-4")}>
            Go to settings <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Compose"
        description="Write once, choose the accounts, schedule it. Nothing publishes without an approval or an autopublish brand."
      />
      <ComposeForm
        brands={brands.map((brand) => ({ id: brand.id, name: brand.name, hashtagSets: brand.hashtagSets }))}
        accounts={accounts
          .filter((account) => account.status === "connected")
          .map((account) => ({ id: account.id, handle: account.handle, platform: account.platform }))}
        defaultScheduledAt={istInputValue(defaultWhen)}
      />
    </>
  );
}

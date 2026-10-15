import { MobileNav, Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { countsForNav } from "@/lib/nav-counts";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const counts = await countsForNav();

  return (
    <div className="flex min-h-screen">
      <Sidebar counts={counts} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <MobileNav counts={counts} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-7">{children}</main>
        <footer className="border-t border-line bg-white px-5 py-3 text-center text-[11.5px] text-muted">
          Centum Studio · Phase 1 · official Instagram &amp; YouTube APIs only — no browser automation, ever.
        </footer>
      </div>
    </div>
  );
}

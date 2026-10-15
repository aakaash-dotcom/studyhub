import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-7">{children}</main>
        <footer className="border-t border-line bg-white px-5 py-3 text-center text-[11.5px] text-muted">
          Centum Studio · Phase 1 · official Instagram &amp; YouTube APIs only — no browser automation, ever.
        </footer>
      </div>
    </div>
  );
}

import Link from "next/link";

export function StatCard({
  label,
  value,
  hint,
  href,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  href?: string;
  tone?: "default" | "warning" | "danger" | "success";
}) {
  const valueTone =
    tone === "warning" ? "text-amber-600" : tone === "danger" ? "text-rose-600" : tone === "success" ? "text-emerald-600" : "text-ink";
  const inner = (
    <div className="card h-full px-5 py-4 transition-colors hover:border-indigo-200">
      <p className="text-[12px] font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-1.5 text-2xl font-semibold ${valueTone}`}>{value}</p>
      {hint ? <p className="mt-1 text-[12px] text-muted">{hint}</p> : null}
    </div>
  );
  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

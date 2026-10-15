import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { listPosts } from "@centum/core";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { istTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Calendar works in IST — the operator, the audience and the schedule all live there. */
function istParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");
  return { year: get("year"), month: get("month"), day: get("day") };
}

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const [{ month }, posts] = await Promise.all([searchParams, listPosts({ limit: 200 })]);

  const now = new Date();
  const [yearStr, monthStr] = (month ?? monthKey(now)).split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  const first = new Date(Date.UTC(year, monthIndex, 1));
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const leadingBlanks = (first.getUTCDay() + 6) % 7; // Monday-first grid

  const byDay = new Map<string, typeof posts>();
  for (const post of posts) {
    if (!post.scheduledAt) continue;
    const { year: y, month: m, day: d } = istParts(post.scheduledAt);
    const key = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const list = byDay.get(key) ?? [];
    list.push(post);
    byDay.set(key, list);
  }

  const prev = new Date(Date.UTC(year, monthIndex - 1, 1));
  const next = new Date(Date.UTC(year, monthIndex + 1, 1));
  const scheduledThisMonth = [...byDay.entries()].filter(([key]) => key.startsWith(`${year}-${String(monthIndex + 1).padStart(2, "0")}`)).reduce((sum, [, list]) => sum + list.length, 0);

  return (
    <>
      <PageHeader
        title="Calendar"
        description={`${scheduledThisMonth} scheduled this month. Times shown in IST. Drag-to-reschedule arrives in Sprint 7.`}
        action={
          <div className="flex items-center gap-2">
            <Link href={`/calendar?month=${monthKey(prev)}`} className={buttonClass("secondary", "sm")}>
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </Link>
            <span className="min-w-[130px] text-center text-[13.5px] font-semibold">
              {MONTHS[monthIndex]} {year}
            </span>
            <Link href={`/calendar?month=${monthKey(next)}`} className={buttonClass("secondary", "sm")}>
              Next <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        }
      />

      <Card>
        <div className="grid grid-cols-7 border-b border-line">
          {DAYS.map((day) => (
            <div key={day} className="px-3 py-2 text-center text-[11.5px] font-semibold uppercase tracking-wide text-muted">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: leadingBlanks }).map((_, index) => (
            <div key={`blank-${index}`} className="min-h-[104px] border-b border-r border-line/60 bg-slate-50/40" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const items = byDay.get(key) ?? [];
            const isToday = istParts(now).year === year && istParts(now).month === monthIndex + 1 && istParts(now).day === day;
            return (
              <div key={key} className={`min-h-[104px] border-b border-r border-line/60 p-1.5 ${isToday ? "bg-indigo-50/50" : ""}`}>
                <div className={`mb-1 flex h-5 w-5 items-center justify-center rounded-full text-[11.5px] font-semibold ${isToday ? "bg-brand text-white" : "text-muted"}`}>
                  {day}
                </div>
                <div className="flex flex-col gap-1">
                  {items.slice(0, 3).map((post) => (
                    <Link
                      key={post.id}
                      href={`/queue?post=${post.id}`}
                      className="truncate rounded-md border border-indigo-100 bg-white px-1.5 py-1 text-[10.5px] font-medium text-indigo-700 hover:border-indigo-300"
                      title={post.title || post.captionMaster}
                    >
                      {istTime(post.scheduledAt)} · {post.title || "Untitled"}
                    </Link>
                  ))}
                  {items.length > 3 ? <span className="px-1.5 text-[10.5px] text-muted">+{items.length - 3} more</span> : null}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="mt-5">
        <CardBody className="flex items-start gap-3">
          <CalendarDays className="mt-0.5 h-4 w-4 text-slate-400" />
          <div>
            <p className="text-[13px] font-medium">How scheduling will behave (Sprint 6)</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
              Each account gets posting windows (default 7–9 am, 4–6 pm, 8:30–10 pm IST) and a daily cap. Posts are spread
              inside those windows with a randomised offset so eight pages never publish at the same second, and each job is
              idempotent — a restart can never double-post.
            </p>
          </div>
        </CardBody>
      </Card>
    </>
  );
}

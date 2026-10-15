"use client";

import { useActionState, useState } from "react";
import { CalendarClock, Eye, Loader2, Save, Send } from "lucide-react";
import { createPostAction, type ActionState } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/field";

type BrandOption = { id: string; name: string; hashtagSets: Record<string, string[]> };
type AccountOption = { id: string; handle: string; platform: string };

export function ComposeForm({
  brands,
  accounts,
  defaultScheduledAt,
}: {
  brands: BrandOption[];
  accounts: AccountOption[];
  defaultScheduledAt: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createPostAction, null);
  const [caption, setCaption] = useState("");
  const [brandId, setBrandId] = useState(brands[0]?.id ?? "");
  const [selected, setSelected] = useState<string[]>(accounts.length === 1 ? [accounts[0]!.id] : []);

  const toggle = (id: string) =>
    setSelected((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));

  const suggestedTags = brands.find((brand) => brand.id === brandId)?.hashtagSets?.default ?? [];
  const previewHandle = accounts.find((account) => selected.includes(account.id))?.handle;

  return (
    <form action={formAction} className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
      <div className="flex flex-col gap-5">
        <Card>
          <CardHeader title="The post" subtitle="One caption can carry every platform; per-platform overrides come in Sprint 7." />
          <CardBody className="flex flex-col gap-4">
            <div>
              <Label htmlFor="brandId">Brand</Label>
              <Select id="brandId" name="brandId" value={brandId} onChange={(event) => setBrandId(event.target.value)} required>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="title" hint="optional">
                Internal title
              </Label>
              <Input id="title" name="title" placeholder="e.g. TN10 Maths — Trigonometry Q4" />
            </div>

            <div>
              <Label htmlFor="caption" hint={`${caption.length} characters`}>
                Caption
              </Label>
              <Textarea
                id="caption"
                name="caption"
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                placeholder={"இன்றைய கணக்கு — 10வது வகுப்பு கணிதம்\n\nAnswer in comments 👇 #centumapp"}
                required
              />
              <p className="mt-1.5 text-[11.5px] text-muted">
                Tamil and English both work. Instagram allows 2,200 characters and 30 hashtags.
              </p>
            </div>

            <div>
              <Label htmlFor="hashtags" hint={suggestedTags.length ? `brand set: ${suggestedTags.join(" ")}` : undefined}>
                Hashtags
              </Label>
              <Input id="hashtags" name="hashtags" placeholder={suggestedTags.join(" ") || "#centumapp #tnstudents"} />
            </div>

            <div>
              <Label htmlFor="scheduledAt" hint="IST">
                Publish at
              </Label>
              <Input id="scheduledAt" name="scheduledAt" type="datetime-local" defaultValue={defaultScheduledAt} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Where it goes" subtitle="Pick the accounts. Media attaches in Sprint 3." />
          <CardBody>
            {accounts.length ? (
              <div className="flex flex-col gap-2">
                {accounts.map((account) => (
                  <label
                    key={account.id}
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-line px-3 py-2.5 hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2 text-[13.5px]">
                      <input
                        type="checkbox"
                        name="accountIds"
                        value={account.id}
                        checked={selected.includes(account.id)}
                        onChange={() => toggle(account.id)}
                        className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand/30"
                      />
                      <span className="font-medium">{account.handle}</span>
                      <span className="text-muted">· {account.platform}</span>
                    </span>
                    <Badge tone={account.platform === "instagram" ? "brand" : "danger"}>
                      {account.platform === "instagram" ? "Reel" : "Short"}
                    </Badge>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-muted">
                No accounts connected yet — open <span className="font-medium text-ink">Accounts</span> and connect a demo
                account to continue.
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="flex flex-col gap-5">
        <Card className="lg:sticky lg:top-5">
          <CardHeader title="Preview" subtitle="Approximate look on mobile." />
          <CardBody>
            <div className="mx-auto w-full max-w-[260px] rounded-2xl border border-line bg-white p-3">
              <div className="flex items-center gap-2">
                <span className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-400 to-pink-400" />
                <div className="leading-tight">
                  <p className="text-[12px] font-semibold">{previewHandle ?? "no account selected"}</p>
                  <p className="text-[10.5px] text-muted">Madurai · IST</p>
                </div>
              </div>
              <div className="mt-2.5 grid aspect-[9/16] place-items-center rounded-lg border border-dashed border-line bg-canvas text-center">
                <div className="px-3">
                  <Eye className="mx-auto h-4 w-4 text-slate-400" />
                  <p className="mt-1 text-[11px] text-muted">Media preview arrives with the media box (Sprint 3)</p>
                </div>
              </div>
              <p className="mt-2.5 whitespace-pre-wrap text-[11.5px] leading-relaxed text-slate-700">
                {caption ? (caption.length > 180 ? `${caption.slice(0, 180)}…` : caption) : "Your caption appears here."}
              </p>
            </div>
          </CardBody>
        </Card>

        {state?.error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-700">{state.error}</p>
        ) : null}
        {state?.success ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-700">{state.success}</p>
        ) : null}

        <div className="flex flex-col gap-2">
          <Button type="submit" name="intent" value="schedule" disabled={pending || !accounts.length}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
            Schedule &amp; queue
          </Button>
          <Button type="submit" name="intent" value="review" variant="secondary" disabled={pending || !accounts.length}>
            <Send className="h-4 w-4" /> Send for review
          </Button>
          <Button type="submit" name="intent" value="draft" variant="ghost" disabled={pending || !accounts.length}>
            <Save className="h-4 w-4" /> Save as draft
          </Button>
        </div>
      </div>
    </form>
  );
}

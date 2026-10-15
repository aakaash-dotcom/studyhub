"use client";

import { useActionState } from "react";
import { Loader2, Plus } from "lucide-react";
import { createBrandAction, type ActionState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";

export function BrandForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createBrandAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="name">Brand name</Label>
          <Input id="name" name="name" placeholder="e.g. TN10 Maths Daily" required />
        </div>
        <div>
          <Label htmlFor="audience" hint="optional">
            Audience
          </Label>
          <Input id="audience" name="audience" placeholder="e.g. 10th standard students, Tamil medium" />
        </div>
      </div>
      <div>
        <Label htmlFor="pillars" hint="comma separated">
          Content pillars
        </Label>
        <Input id="pillars" name="pillars" placeholder="Question of the day, Formula sheet, Exam tips" />
      </div>
      <div>
        <Label htmlFor="hashtags" hint="space or comma separated">
          Default hashtags
        </Label>
        <Input id="hashtags" name="hashtags" placeholder="#tn10maths #samacheer #centumapp" />
      </div>
      <div>
        <Label htmlFor="tone" hint="optional">
          Tone guide
        </Label>
        <Textarea id="tone" name="tone" className="min-h-[80px]" placeholder="Encouraging, exam-focused, plain Tamil with English technical words." />
      </div>

      {state?.error ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-700">{state.error}</p> : null}
      {state?.success ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-700">{state.success}</p>
      ) : null}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Create brand
        </Button>
      </div>
    </form>
  );
}

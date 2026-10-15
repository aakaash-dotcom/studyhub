import { cn } from "./button";

export function Label({ children, htmlFor, hint }: { children: React.ReactNode; htmlFor?: string; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between">
      <span className="text-[13px] font-medium text-ink">{children}</span>
      {hint ? <span className="text-[11px] text-muted">{hint}</span> : null}
    </label>
  );
}

const base =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:bg-slate-50";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(base, "h-10", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(base, "min-h-[120px] leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(base, "h-10 pr-8", className)} {...props}>
      {children}
    </select>
  );
}

export function Checkbox({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="checkbox" className={cn("h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand/30", className)} {...props} />;
}

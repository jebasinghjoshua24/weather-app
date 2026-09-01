import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        "border-transparent bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900",
        className
      )}
      {...props}
    />
  );
}

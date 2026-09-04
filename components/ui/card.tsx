import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bezel p-1.5 rounded-[2rem] bg-white/60 dark:bg-white/[0.06] ring-1 ring-black/[0.04] dark:ring-white/[0.06] shadow-[0_24px_48px_-12px_rgba(15,23,42,0.08)] dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.45)]", className)} {...props}>
      <div className="bezel-inner overflow-hidden rounded-[calc(2rem-0.375rem)] bg-white/75 dark:bg-zinc-900/70 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.85)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">{children}</div>
    </div>
  );
}
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-semibold leading-none tracking-tight", className)} {...props} />;
}
export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

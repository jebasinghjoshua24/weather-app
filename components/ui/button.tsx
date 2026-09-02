import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "ghost" | "outline" };

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50";
  const variants = {
    default: "bg-primary text-primary-foreground hover:opacity-90",
    ghost: "hover:bg-muted",
    outline: "border bg-card hover:bg-muted",
  } as const;
  return <button className={cn(base, variants[variant], className)} {...props} />;
}

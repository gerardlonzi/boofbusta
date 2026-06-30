import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variant === "default" && "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900",
        variant === "secondary" && "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50",
        variant === "outline" && "border border-zinc-200 text-zinc-950 dark:border-zinc-800",
        className
      )}
      {...props}
    />
  );
}

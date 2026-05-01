import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
  label,
}: LoadingSpinnerProps) {
  const sizeClass = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
  }[size];
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className,
      )}
      data-ocid="loading_state"
    >
      <div
        className={cn(
          "rounded-full border-border border-t-primary animate-spin",
          sizeClass,
        )}
        aria-label={label ?? "Loading..."}
        role="status"
      />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  );
}

export function PageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div
      className="flex-1 flex items-center justify-center min-h-64"
      data-ocid="loading_state"
    >
      <LoadingSpinner size="lg" label={label} />
    </div>
  );
}

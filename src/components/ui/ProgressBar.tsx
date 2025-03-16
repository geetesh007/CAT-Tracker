
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  indicatorClassName?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
  label?: string;
}

export function ProgressBar({
  value,
  max,
  className,
  indicatorClassName,
  showValue = false,
  size = "md",
  animate = true,
  label
}: ProgressBarProps) {
  const [width, setWidth] = useState(0);
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);
  
  useEffect(() => {
    // Delay animation slightly for a nice effect
    const timer = setTimeout(() => {
      setWidth(percentage);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [percentage]);
  
  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4"
  };
  
  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && <p className="text-muted-foreground">{label}</p>}
          {showValue && (
            <p className="text-muted-foreground font-medium">{value}/{max}</p>
          )}
        </div>
      )}
      <div className="relative w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full w-full flex-1 rounded-full bg-primary transition-all duration-500 ease-in-out",
            sizeClasses[size],
            animate ? "" : "transition-none",
            indicatorClassName
          )}
          style={{ width: animate ? `${width}%` : `${percentage}%` }}
        />
      </div>
    </div>
  );
}

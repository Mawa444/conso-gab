import { ReactNode, memo } from "react";
import { cn } from "@/lib/utils";

interface OptimizedPageTransitionProps {
  children: ReactNode;
  className?: string;
}

export const OptimizedPageTransition = memo(({ 
  children, 
  className 
}: OptimizedPageTransitionProps) => {
  return (
    <div 
      className={cn(
        "w-full h-full opacity-100 transform-none", // Remove will-change and animations for instant display
        className
      )}
    >
      {children}
    </div>
  );
});

OptimizedPageTransition.displayName = "OptimizedPageTransition";
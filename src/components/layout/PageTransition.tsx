import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: ReactNode;
  direction?: "left" | "right" | "up" | "down" | "fade";
  className?: string;
}

export const PageTransition = ({ 
  children, 
  direction = "fade", 
  className 
}: PageTransitionProps) => {
  const getAnimationClass = () => {
    switch (direction) {
      case "left":
        return "animate-slide-in-left";
      case "right":
        return "animate-slide-in-right";
      case "up":
        return "animate-slide-up";
      case "down":
        return "animate-slide-down";
      case "fade":
      default:
        return "animate-fade-in";
    }
  };

  return (
    <div 
      className={cn(
        "w-full h-full will-change-transform",
        getAnimationClass(),
        className
      )}
    >
      {children}
    </div>
  );
};
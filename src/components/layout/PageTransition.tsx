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
    // Pas d'animations - juste retourner une classe vide
    return "";
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
import { cn } from "@/lib/utils";

interface GabonLoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export const GabonLoading = ({ className, size = "md", text }: GabonLoadingProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        {/* Cercles animés aux couleurs du drapeau gabonais */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#009639] animate-spin"></div>
        <div className="absolute inset-1 rounded-full border-4 border-transparent border-t-[#FCD116] animate-spin animate-reverse" style={{ animationDelay: '0.15s' }}></div>
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-[#3A75C4] animate-spin" style={{ animationDelay: '0.3s' }}></div>
      </div>
      
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
};
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useNearestCommerce } from "@/hooks/use-nearest-commerce";
import { MapPin, Star } from "lucide-react";

interface CategoryLinkProps {
  category: {
    id: string;
    name: string;
    count: number;
    icon: string;
    color: string;
  };
  variant?: "card" | "button" | "chip" | "compact";
  showNearestInfo?: boolean;
  onClick?: () => void;
  className?: string;
}

export const CategoryLink = ({ 
  category, 
  variant = "card", 
  showNearestInfo = false,
  onClick,
  className 
}: CategoryLinkProps) => {
  const { findNearestByCategory } = useNearestCommerce();
  
  const nearestCommerce = showNearestInfo ? findNearestByCategory(category.id) : null;

  const handleClick = () => {
    onClick?.();
  };

  if (variant === "button") {
    return (
      <Button
        asChild
        variant="outline"
        className={cn("justify-start gap-3 h-auto p-4", className)}
        onClick={handleClick}
      >
        <Link to={`/category/${category.id}`}>
          <span className="text-2xl">{category.icon}</span>
          <div className="flex-1 text-left">
            <div className="font-medium">{category.name}</div>
            <div className="text-xs text-muted-foreground">{category.count} établissements</div>
            {nearestCommerce && (
              <div className="flex items-center gap-1 text-xs text-primary mt-1">
                <MapPin className="w-3 h-3" />
                <span>{nearestCommerce.name} à {nearestCommerce.distance}</span>
              </div>
            )}
          </div>
        </Link>
      </Button>
    );
  }

  if (variant === "chip") {
    return (
      <Link 
        to={`/category/${category.id}`}
        onClick={handleClick}
        className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground hover:bg-accent cursor-pointer", className)}
      >
        <span className="mr-1">{category.icon}</span>
        {category.name}
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        to={`/category/${category.id}`}
        onClick={handleClick}
        className={cn("flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors", className)}
      >
        <span className="text-lg">{category.icon}</span>
        <div className="text-sm font-medium">{category.name}</div>
        <div className="text-xs text-muted-foreground ml-auto">{category.count}</div>
      </Link>
    );
  }

  // Default card variant
  return (
    <Link
      to={`/category/${category.id}`}
      onClick={handleClick}
      className={cn(
        "group block bg-gradient-to-br rounded-2xl p-6 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
        category.color,
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{category.icon}</span>
        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
          {category.count}
        </Badge>
      </div>
      <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
      <p className="text-white/80 text-sm">{category.count} établissements</p>
      
      {nearestCommerce && (
        <div className="mt-3 pt-3 border-t border-white/20">
          <div className="flex items-center gap-1 text-xs">
            <MapPin className="w-3 h-3" />
            <span>Plus proche: {nearestCommerce.name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs mt-1">
            <Star className="w-3 h-3 fill-current" />
            <span>{nearestCommerce.rating} • {nearestCommerce.distance}</span>
          </div>
        </div>
      )}
    </Link>
  );
};
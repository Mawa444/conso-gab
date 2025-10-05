import { TrendingUp, Users, MapPin, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsBlockProps {
  className?: string;
}

export const StatsBlock = ({ className }: StatsBlockProps) => {
  const stats = [
    {
      icon: MapPin,
      value: "847",
      label: "Commerces",
      change: "+23",
      color: "text-primary"
    },
    {
      icon: Users,
      value: "12.4k",
      label: "Utilisateurs",
      change: "+156",
      color: "text-accent"
    },
    {
      icon: Star,
      value: "3.2k",
      label: "Avis",
      change: "+89",
      color: "text-secondary"
    },
    {
      icon: TrendingUp,
      value: "4.8",
      label: "Note moyenne",
      change: "+0.2",
      color: "text-yellow-500"
    }
  ];

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card 
            key={index}
            className="border-2 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-[var(--shadow-soft)] group"
          >
            <CardContent className="p-4 text-center">
              <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <IconComponent className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                {stat.label}
              </div>
              <div className="flex items-center justify-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-950/20 rounded-full px-2 py-1">
                <TrendingUp className="w-3 h-3" />
                <span>{stat.change}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
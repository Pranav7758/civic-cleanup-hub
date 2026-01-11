import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "outline" | "destructive";
  };
  color?: "green" | "blue" | "amber" | "rose" | "purple" | "teal";
  className?: string;
}

const colorStyles = {
  green: {
    icon: "text-eco-green bg-eco-green/10",
    value: "text-eco-green",
  },
  blue: {
    icon: "text-eco-sky bg-eco-sky/10",
    value: "text-eco-sky",
  },
  amber: {
    icon: "text-eco-amber bg-eco-amber/10",
    value: "text-eco-amber",
  },
  rose: {
    icon: "text-eco-rose bg-eco-rose/10",
    value: "text-eco-rose",
  },
  purple: {
    icon: "text-eco-purple bg-eco-purple/10",
    value: "text-eco-purple",
  },
  teal: {
    icon: "text-eco-teal bg-eco-teal/10",
    value: "text-eco-teal",
  },
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  badge,
  color = "green",
  className,
}: StatsCardProps) {
  const styles = colorStyles[color];

  return (
    <Card className={cn("shadow-card border-0 hover:shadow-hover transition-shadow", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className={cn("text-2xl font-bold", styles.value)}>{value}</p>
            {trend && (
              <p className={cn(
                "text-xs font-medium flex items-center gap-1",
                trend.isPositive ? "text-status-success" : "text-status-error"
              )}>
                <span>{trend.isPositive ? "↑" : "↓"}</span>
                {trend.value}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={cn("p-3 rounded-xl", styles.icon)}>
              <Icon className="h-6 w-6" />
            </div>
            {badge && (
              <Badge variant={badge.variant || "secondary"} className="text-xs">
                {badge.text}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

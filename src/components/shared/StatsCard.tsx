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
    icon: "text-moss bg-moss/10 group-hover:bg-moss group-hover:text-white",
    value: "text-moss",
  },
  blue: {
    icon: "text-[#5A8A9E] bg-[#5A8A9E]/10 group-hover:bg-[#5A8A9E] group-hover:text-white",
    value: "text-[#5A8A9E]",
  },
  amber: {
    icon: "text-clay bg-clay/10 group-hover:bg-clay group-hover:text-white",
    value: "text-clay",
  },
  rose: {
    icon: "text-burnt-sienna bg-burnt-sienna/10 group-hover:bg-burnt-sienna group-hover:text-white",
    value: "text-burnt-sienna",
  },
  purple: {
    icon: "text-[#7A6890] bg-[#7A6890]/10 group-hover:bg-[#7A6890] group-hover:text-white",
    value: "text-[#7A6890]",
  },
  teal: {
    icon: "text-[#6E9B88] bg-[#6E9B88]/10 group-hover:bg-[#6E9B88] group-hover:text-white",
    value: "text-[#6E9B88]",
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
    <Card className={cn(
      "shadow-soft border-timber/30 hover:shadow-float hover:-translate-y-1 transition-all duration-300 group overflow-hidden",
      "rounded-[1.5rem]",
      className
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-semibold">{title}</p>
            <p className={cn("text-2xl font-display font-bold group-hover:scale-110 transition-transform duration-300 origin-left", styles.value)}>{value}</p>
            {trend && (
              <p className={cn(
                "text-xs font-semibold flex items-center gap-1",
                trend.isPositive ? "text-moss" : "text-burnt-sienna"
              )}>
                <span>{trend.isPositive ? "↑" : "↓"}</span>
                {trend.value}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={cn("p-3 rounded-2xl transition-all duration-300", styles.icon)}>
              <Icon className="h-6 w-6" />
            </div>
            {badge && (
              <Badge variant={badge.variant || "secondary"} className="text-xs rounded-full">
                {badge.text}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

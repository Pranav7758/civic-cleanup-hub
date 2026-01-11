import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavItem {
  icon: LucideIcon;
  label: string;
  value: string;
  badge?: number;
}

interface BottomNavProps {
  items: NavItem[];
  activeItem: string;
  onItemClick: (value: string) => void;
  moduleColor?: "citizen" | "worker" | "ngo" | "scrap" | "admin";
}

const moduleColors = {
  citizen: "text-primary",
  worker: "text-secondary",
  ngo: "text-eco-rose",
  scrap: "text-eco-amber",
  admin: "text-eco-purple",
};

const moduleBgColors = {
  citizen: "bg-primary/10",
  worker: "bg-secondary/10",
  ngo: "bg-eco-rose/10",
  scrap: "bg-eco-amber/10",
  admin: "bg-eco-purple/10",
};

export function BottomNav({ items, activeItem, onItemClick, moduleColor = "citizen" }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border md:hidden">
      <div className="flex items-center justify-around py-2 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.value;
          
          return (
            <button
              key={item.value}
              onClick={() => onItemClick(item.value)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 relative min-w-[64px]",
                isActive 
                  ? `${moduleBgColors[moduleColor]} scale-105` 
                  : "hover:bg-muted"
              )}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? moduleColors[moduleColor] : "text-muted-foreground"
                  )} 
                />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span 
                className={cn(
                  "text-[10px] mt-1 font-medium transition-colors",
                  isActive ? moduleColors[moduleColor] : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Safe area padding for mobile */}
      <div className="h-safe-area-inset-bottom bg-card" />
    </nav>
  );
}

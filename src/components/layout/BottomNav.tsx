import { cn } from "@/lib/utils";
import { LucideIcon, Leaf } from "lucide-react";

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
    <>
      {/* Mobile Bottom Navigation */}
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
                  isActive ? `${moduleBgColors[moduleColor]} scale-105` : "hover:bg-muted"
                )}
              >
                <div className="relative">
                  <Icon className={cn("h-5 w-5 transition-colors", isActive ? moduleColors[moduleColor] : "text-muted-foreground")} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
                <span className={cn("text-[10px] mt-1 font-medium transition-colors", isActive ? moduleColors[moduleColor] : "text-muted-foreground")}>{item.label}</span>
              </button>
            );
          })}
        </div>
        <div className="h-safe-area-inset-bottom bg-card" />
      </nav>

      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-40 p-4">
        <div className="flex items-center gap-3 px-2 py-4 mb-4">
          <div className={`p-2 rounded-lg bg-gradient-to-br from-primary/80 to-primary text-white shadow-sm`}>
            <Leaf className="h-6 w-6" /> {/* Brand Placeholder */}
          </div>
          <span className="font-display font-bold text-xl tracking-tight">EcoConnect</span>
        </div>
        
        <div className="flex flex-col gap-2 flex-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.value;
            return (
              <button
                key={item.value}
                onClick={() => onItemClick(item.value)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left font-medium",
                  isActive ? `${moduleBgColors[moduleColor]} shadow-sm` : "hover:bg-muted/60 text-muted-foreground"
                )}
              >
                <div className="relative">
                  <Icon className={cn("h-5 w-5 transition-colors", isActive ? moduleColors[moduleColor] : "text-muted-foreground")} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 h-4 w-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
                <span className={cn("text-sm", isActive ? moduleColors[moduleColor] : "text-muted-foreground")}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

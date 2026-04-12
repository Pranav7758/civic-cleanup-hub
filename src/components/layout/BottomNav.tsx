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

const moduleColors: Record<string, string> = {
  citizen: "text-moss",
  worker: "text-[#5A8A9E]",
  ngo: "text-burnt-sienna",
  scrap: "text-clay",
  admin: "text-[#7A6890]",
};

const moduleBgColors: Record<string, string> = {
  citizen: "bg-moss/10",
  worker: "bg-[#5A8A9E]/10",
  ngo: "bg-burnt-sienna/10",
  scrap: "bg-clay/10",
  admin: "bg-[#7A6890]/10",
};

export function BottomNav({ items, activeItem, onItemClick, moduleColor = "citizen" }: BottomNavProps) {
  return (
    <>
      {/* Mobile — floating pill bottom nav */}
      <nav className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
        <div className="glass rounded-full shadow-float px-2 py-2">
          <div className="flex items-center justify-around">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => onItemClick(item.value)}
                  className={cn(
                    "flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-300 relative",
                    isActive ? `${moduleBgColors[moduleColor]} scale-105` : "hover:bg-muted/40"
                  )}
                >
                  <div className="relative">
                    <Icon className={cn("h-5 w-5 transition-colors duration-300", isActive ? moduleColors[moduleColor] : "text-muted-foreground")} />
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 bg-burnt-sienna text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </div>
                  <span className={cn("text-[9px] mt-0.5 font-semibold transition-colors duration-300", isActive ? moduleColors[moduleColor] : "text-muted-foreground")}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Desktop — organic sidebar */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 z-40 p-4">
        <div className="flex flex-col h-full bg-card/90 backdrop-blur-sm rounded-[2rem] border border-timber/30 shadow-soft p-4">
          {/* Brand */}
          <div className="flex items-center gap-3 px-3 py-4 mb-4">
            <div className="p-2.5 rounded-full bg-moss shadow-sm">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">EcoConnect</span>
          </div>
          
          <div className="flex flex-col gap-1.5 flex-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => onItemClick(item.value)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-300 w-full text-left font-semibold",
                    isActive
                      ? `${moduleBgColors[moduleColor]} shadow-sm`
                      : "hover:bg-muted/40 text-muted-foreground"
                  )}
                >
                  <div className="relative">
                    <Icon className={cn("h-5 w-5 transition-colors duration-300", isActive ? moduleColors[moduleColor] : "text-muted-foreground")} />
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-2 -right-2 h-4 w-4 bg-burnt-sienna text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </div>
                  <span className={cn("text-sm", isActive ? moduleColors[moduleColor] : "text-muted-foreground")}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}

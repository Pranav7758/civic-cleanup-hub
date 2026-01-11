import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { LucideIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface SidebarItem {
  icon: LucideIcon;
  label: string;
  value: string;
  badge?: number;
  children?: SidebarItem[];
}

interface SidebarProps {
  items: SidebarItem[];
  activeItem: string;
  onItemClick: (value: string) => void;
  moduleColor?: "citizen" | "worker" | "ngo" | "scrap" | "admin";
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const moduleColors = {
  citizen: "bg-primary text-primary-foreground",
  worker: "bg-secondary text-secondary-foreground",
  ngo: "bg-eco-rose text-white",
  scrap: "bg-eco-amber text-white",
  admin: "bg-eco-purple text-white",
};

const moduleHoverColors = {
  citizen: "hover:bg-primary/10 hover:text-primary",
  worker: "hover:bg-secondary/10 hover:text-secondary",
  ngo: "hover:bg-eco-rose/10 hover:text-eco-rose",
  scrap: "hover:bg-eco-amber/10 hover:text-eco-amber",
  admin: "hover:bg-eco-purple/10 hover:text-eco-purple",
};

export function Sidebar({ 
  items, 
  activeItem, 
  onItemClick, 
  moduleColor = "citizen",
  header,
  footer 
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "hidden md:flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      {header && !collapsed && (
        <div className="p-4 border-b border-sidebar-border">
          {header}
        </div>
      )}

      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute right-0 top-4 translate-x-1/2 z-10 h-6 w-6 rounded-full border bg-background shadow-sm"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.value;
            
            return (
              <button
                key={item.value}
                onClick={() => onItemClick(item.value)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left",
                  isActive 
                    ? moduleColors[moduleColor]
                    : `text-sidebar-foreground ${moduleHoverColors[moduleColor]}`
                )}
              >
                <div className="relative flex-shrink-0">
                  <Icon className="h-5 w-5" />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
                {!collapsed && (
                  <span className="font-medium text-sm truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      {footer && (
        <>
          <Separator />
          <div className={cn("p-4", collapsed && "p-2")}>
            {footer}
          </div>
        </>
      )}
    </aside>
  );
}

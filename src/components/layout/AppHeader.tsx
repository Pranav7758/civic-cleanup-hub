import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  Leaf,
  ChevronDown,
  ArrowLeft
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  userName?: string;
  userAvatar?: string;
  moduleColor?: "citizen" | "worker" | "ngo" | "scrap" | "admin";
  notifications?: number;
  icon?: React.ReactNode;
  onBack?: () => void;
  showBack?: boolean;
}

const moduleAccents: Record<string, string> = {
  citizen: "bg-moss",
  worker: "bg-[#5A8A9E]",
  ngo: "bg-[#A85448]",
  scrap: "bg-clay",
  admin: "bg-[#7A6890]",
};

export function AppHeader({
  title,
  subtitle,
  userName = "User",
  moduleColor = "citizen",
  notifications = 0,
  icon,
  onBack,
  showBack = false,
}: AppHeaderProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40">
      <div className="mx-4 mt-3 mb-1">
        <div className="glass rounded-full px-4 py-2.5 shadow-soft">
          <div className="flex items-center justify-between">
            {/* Left section */}
            <div className="flex items-center gap-3">
              {showBack && (
                <button 
                  onClick={onBack}
                  className="p-2 rounded-full hover:bg-muted/60 transition-colors duration-300"
                >
                  <ArrowLeft className="h-5 w-5 text-foreground" />
                </button>
              )}
              <div className={`p-2 rounded-full ${moduleAccents[moduleColor]} shadow-sm`}>
                {icon || <Leaf className="h-5 w-5 text-white" />}
              </div>
              <div>
                <h1 className="text-base font-display font-bold text-foreground leading-tight">{title}</h1>
                {subtitle && (
                  <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-1.5">
              {/* Notifications */}
              <button className="relative p-2 rounded-full hover:bg-muted/60 transition-colors duration-300">
                <Bell className="h-4.5 w-4.5 text-muted-foreground" />
                {notifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center text-[9px] font-bold rounded-full bg-burnt-sienna text-white">
                    {notifications > 9 ? "9+" : notifications}
                  </span>
                )}
              </button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 p-1.5 pl-2 rounded-full hover:bg-muted/60 transition-colors duration-300">
                    <div className="h-7 w-7 rounded-full bg-moss/10 flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-moss" />
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-2xl shadow-float border-timber/50 mt-2">
                  <DropdownMenuLabel className="font-display">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="rounded-xl">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-burnt-sienna rounded-xl"
                    onClick={async () => {
                      await signOut();
                      navigate("/");
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

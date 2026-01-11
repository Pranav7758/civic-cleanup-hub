import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Loader2,
  Play,
  Pause,
  Truck
} from "lucide-react";

type StatusType = 
  | "pending" 
  | "in_progress" 
  | "completed" 
  | "cancelled" 
  | "accepted" 
  | "rejected"
  | "on_the_way"
  | "verified"
  | "waiting";

interface StatusBadgeProps {
  status: StatusType;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<StatusType, {
  label: string;
  icon: React.ElementType;
  className: string;
}> = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-status-pending/10 text-status-pending border-status-pending/20",
  },
  waiting: {
    label: "Waiting",
    icon: Pause,
    className: "bg-muted text-muted-foreground border-border",
  },
  in_progress: {
    label: "In Progress",
    icon: Loader2,
    className: "bg-status-info/10 text-status-info border-status-info/20",
  },
  on_the_way: {
    label: "On the Way",
    icon: Truck,
    className: "bg-status-info/10 text-status-info border-status-info/20",
  },
  accepted: {
    label: "Accepted",
    icon: Play,
    className: "bg-eco-teal/10 text-eco-teal border-eco-teal/20",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    className: "bg-status-success/10 text-status-success border-status-success/20",
  },
  verified: {
    label: "Verified",
    icon: CheckCircle,
    className: "bg-status-success/10 text-status-success border-status-success/20",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-muted text-muted-foreground border-border",
  },
  rejected: {
    label: "Rejected",
    icon: AlertCircle,
    className: "bg-status-error/10 text-status-error border-status-error/20",
  },
};

const sizeStyles = {
  sm: "text-xs px-2 py-0.5 gap-1",
  md: "text-sm px-2.5 py-1 gap-1.5",
  lg: "text-sm px-3 py-1.5 gap-2",
};

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

export function StatusBadge({ 
  status, 
  size = "md", 
  showIcon = true,
  className 
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline"
      className={cn(
        "font-medium border inline-flex items-center",
        sizeStyles[size],
        config.className,
        className
      )}
    >
      {showIcon && (
        <Icon className={cn(
          iconSizes[size],
          status === "in_progress" && "animate-spin"
        )} />
      )}
      {config.label}
    </Badge>
  );
}

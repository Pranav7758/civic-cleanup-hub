import { cn } from "@/lib/utils";

interface ScoreCircleProps {
  score: number;
  maxScore?: number;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const sizeStyles = {
  sm: { container: "h-16 w-16", text: "text-lg", stroke: 4 },
  md: { container: "h-24 w-24", text: "text-2xl", stroke: 5 },
  lg: { container: "h-32 w-32", text: "text-3xl", stroke: 6 },
  xl: { container: "h-40 w-40", text: "text-4xl", stroke: 8 },
};

const getScoreColor = (percentage: number) => {
  if (percentage >= 80) return "stroke-eco-green";
  if (percentage >= 60) return "stroke-eco-teal";
  if (percentage >= 40) return "stroke-eco-amber";
  if (percentage >= 20) return "stroke-eco-orange";
  return "stroke-eco-rose";
};

const getScoreGrade = (percentage: number) => {
  if (percentage >= 90) return { grade: "A+", label: "Excellent" };
  if (percentage >= 80) return { grade: "A", label: "Great" };
  if (percentage >= 70) return { grade: "B", label: "Good" };
  if (percentage >= 60) return { grade: "C", label: "Average" };
  if (percentage >= 50) return { grade: "D", label: "Fair" };
  return { grade: "F", label: "Needs Improvement" };
};

export function ScoreCircle({
  score,
  maxScore = 1000,
  size = "lg",
  showLabel = true,
  label,
  className,
}: ScoreCircleProps) {
  const percentage = Math.min((score / maxScore) * 100, 100);
  const { container, text, stroke } = sizeStyles[size];
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const scoreInfo = getScoreGrade(percentage);

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className={cn("relative", container)}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth={stroke}
            className="stroke-muted"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            className={cn("transition-all duration-1000 ease-out", getScoreColor(percentage))}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold text-foreground", text)}>{score}</span>
          {size !== "sm" && (
            <span className="text-xs text-muted-foreground font-medium">
              {scoreInfo.grade}
            </span>
          )}
        </div>
      </div>
      {showLabel && (
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">
            {label || scoreInfo.label}
          </p>
          <p className="text-xs text-muted-foreground">
            out of {maxScore} points
          </p>
        </div>
      )}
    </div>
  );
}

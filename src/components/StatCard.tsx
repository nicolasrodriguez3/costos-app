import { ReactNode } from "react";

type StatColor = "green" | "red" | "purple" | "blue" | "orange";

interface StatCardProps {
  title: string;
  value: string | number;
  color?: StatColor;
  icon?: ReactNode;
  subtitle?: string;
  change?: number;
}

const colorStyles: Record<StatColor, string> = {
  green: "text-green-400",
  red: "text-red-400",
  purple: "text-purple-400",
  blue: "text-blue-400",
  orange: "text-orange-400",
};

const changeColorStyles = (change: number) => {
  if (change > 0) return "text-green-500";
  if (change < 0) return "text-red-500";
  return "text-gray-400";
};

export function StatCard({
  title,
  value,
  color = "green",
  icon,
  subtitle,
  change,
}: StatCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-gray-500/5 border border-gray-500/10 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-600 text-sm font-bold uppercase tracking-wider">
          {title}
        </h3>
        {icon && <span className="text-xl opacity-60">{icon}</span>}
      </div>
      <div
        className={`text-3xl md:text-2xl lg:text-3xl font-bold ${colorStyles[color]}`}
      >
        {value}
      </div>
      {(subtitle || change !== undefined) && (
        <p className="text-gray-600 text-xs mt-1 flex items-center gap-2">
          {change !== undefined && (
            <span className={changeColorStyles(change)}>
              {change > 0 ? "↑" : change < 0 ? "↓" : "→"}{" "}
              {Math.abs(change).toFixed(1)}%
            </span>
          )}
          {subtitle}
        </p>
      )}
    </div>
  );
}

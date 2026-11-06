import React from "react";

export type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "nature"
  | "culture"
  | "food"
  | "adventure"
  | "admin"
  | "glass";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: "bg-rose-700 text-white shadow-2xs",
  secondary: "bg-slate-800 text-white shadow-2xs",
  success: "bg-emerald-50 text-emerald-800 border border-emerald-200/80",
  warning: "bg-amber-50 text-amber-900 border border-amber-200/80",
  danger: "bg-rose-50 text-rose-800 border border-rose-200/80",
  nature: "bg-emerald-50 text-emerald-800 border border-emerald-200/80",
  culture: "bg-purple-50 text-purple-800 border border-purple-200/80",
  food: "bg-rose-50 text-rose-800 border border-rose-200/80",
  adventure: "bg-sky-50 text-sky-800 border border-sky-200/80",
  admin: "bg-slate-900 text-amber-400 border border-slate-700 font-extrabold",
  glass: "bg-white/95 backdrop-blur-md text-slate-800 shadow-xs border border-white/60",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-[11px]",
  lg: "px-3 py-1.5 text-xs",
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  icon,
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-subtitle font-bold tracking-wide uppercase transition ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

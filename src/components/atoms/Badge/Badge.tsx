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
  primary: "bg-[#D81B60] text-white shadow-xs",
  secondary: "bg-[#37474F] text-white",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  warning: "bg-amber-50 text-amber-800 border border-amber-200",
  danger: "bg-rose-50 text-rose-700 border border-rose-200",
  nature: "bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]",
  culture: "bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]",
  food: "bg-[#FFE4E6] text-[#BE123C] border border-[#FECDD3]",
  adventure: "bg-[#CFFAFE] text-[#0E7490] border border-[#A5F3FC]",
  admin: "bg-[#1E293B] text-[#F4C430] border border-[#F4C430]/40 font-black",
  glass: "bg-white/90 backdrop-blur-md text-[#37474F] shadow-md border border-white/40",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-3 py-1 text-xs",
  lg: "px-3.5 py-1.5 text-sm",
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
      className={`inline-flex items-center gap-1.5 rounded-full font-subtitle font-bold tracking-wide uppercase transition ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

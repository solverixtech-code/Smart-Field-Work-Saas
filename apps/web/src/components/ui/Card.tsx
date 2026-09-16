import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "panel";
  size?: "sm" | "md" | "lg";
}

export const Card = ({
  className = "",
  size = "lg",
  variant = "default",
  children,
  ...props
}: CardProps) => {
  if (variant === "panel")
    return (
      <div
        className={`rounded-lg border border-slate-200/80 bg-white p-5 shadow-xs ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  const paddingSizes = {
    sm: "p-6 sm:p-8",
    md: "p-8 sm:p-10",
    lg: "p-10 sm:p-12",
  };

  return (
    <div
      className={`w-full max-w-[500px] min-h-[530px] flex flex-col justify-between rounded-sm bg-white shadow-2xl shadow-[#0B2E6B]/15 ${paddingSizes[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

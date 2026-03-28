import type { ReactNode } from "react";
import Link from "next/link";

type BrandButtonProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
  to?: string;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "ghost";
};

const baseClasses =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-6 py-3 text-xs uppercase tracking-[0.26em] transition-all duration-300";

const variantClasses = {
  primary:
    "bg-brand text-white shadow-[0_16px_36px_rgba(243,29,91,0.2)] hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(243,29,91,0.28)]",
  ghost:
    "border border-black/10 bg-white/72 text-ink backdrop-blur-xl hover:-translate-y-0.5 hover:border-brand/25 hover:text-brand",
};

export default function BrandButton({
  children,
  className,
  disabled,
  href,
  onClick,
  to,
  type = "button",
  variant = "primary",
}: BrandButtonProps) {
  const classes = [baseClasses, variantClasses[variant], disabled && "opacity-50 pointer-events-none", className]
    .filter(Boolean)
    .join(" ");

  if (to) {
    return (
      <Link href={to} className={classes}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}

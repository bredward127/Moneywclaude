import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

const VARIANT_CLASSES = {
  primary:
    "bg-blue-600 text-white shadow-sm shadow-blue-900/20 hover:bg-blue-700 focus-visible:outline-blue-600",
  white:
    "bg-white text-slate-900 shadow-sm hover:bg-blue-50 focus-visible:outline-white",
  outlineLight:
    "border border-white/30 text-white hover:bg-white/10 focus-visible:outline-white",
  outlineDark:
    "border border-slate-300 text-slate-900 hover:bg-slate-50 focus-visible:outline-slate-900",
  ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-slate-900",
} as const;

const SIZE_CLASSES = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-4 text-base",
} as const;

export type ButtonVariant = keyof typeof VARIANT_CLASSES;
export type ButtonSize = keyof typeof SIZE_CLASSES;

function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth ? "w-full" : "",
    className ?? "",
  ].join(" ");
}

interface SharedProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  children: ReactNode;
  className?: string;
}

function ButtonContent({
  icon,
  iconPosition = "right",
  isLoading,
  children,
}: {
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        icon && iconPosition === "left" && icon
      )}
      {children}
      {!isLoading && icon && iconPosition === "right" && icon}
    </>
  );
}

type ButtonProps = SharedProps &
  Omit<ComponentPropsWithoutRef<"button">, "className" | "children"> & {
    isLoading?: boolean;
  };

export function Button({
  variant,
  size,
  fullWidth,
  isLoading,
  icon,
  iconPosition,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClasses({ variant, size, fullWidth, className })}
      disabled={isLoading || disabled}
      {...props}
    >
      <ButtonContent icon={icon} iconPosition={iconPosition} isLoading={isLoading}>
        {children}
      </ButtonContent>
    </button>
  );
}

type LinkButtonProps = SharedProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, "className" | "children">;

export function LinkButton({
  variant,
  size,
  fullWidth,
  icon,
  iconPosition,
  children,
  className,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={buttonClasses({ variant, size, fullWidth, className })} {...props}>
      <ButtonContent icon={icon} iconPosition={iconPosition}>
        {children}
      </ButtonContent>
    </Link>
  );
}

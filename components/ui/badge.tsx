import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-mp-beige-warm text-mp-ink",
        primary: "bg-mp-orange-flame text-white",
        secondary: "bg-mp-green-deep text-white",
        outline: "bg-transparent border border-mp-green-deep text-mp-green-deep",
        success: "bg-mp-green-light text-white",
        warning: "bg-mp-orange-warm text-mp-ink",
        eyebrow: "bg-mp-cream border border-mp-sand text-mp-ink-soft uppercase tracking-wider text-[10px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

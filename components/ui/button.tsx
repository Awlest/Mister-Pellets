import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mp-orange-flame focus-visible:ring-offset-2 focus-visible:ring-offset-mp-cream disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // CTA principal — orange flame, le bouton "conversion"
        primary:
          "bg-mp-orange-flame text-white shadow-md hover:bg-mp-orange-warm hover:shadow-lg hover:-translate-y-0.5",
        // CTA secondaire — outline vert deep
        outline:
          "bg-transparent text-mp-green-deep border-2 border-mp-green-deep hover:bg-mp-green-deep hover:text-white",
        // Tertiaire — vert plein
        secondary:
          "bg-mp-green-deep text-white hover:bg-mp-green-mid",
        // Ghost — discret
        ghost:
          "bg-transparent text-mp-ink hover:bg-mp-beige-warm",
        // Lien
        link:
          "bg-transparent text-mp-green-deep underline-offset-4 hover:underline hover:text-mp-orange-flame",
        // Destructif (peu utilisé)
        destructive:
          "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        sm: "h-9 px-4 text-xs rounded-full",
        default: "h-11 px-6 rounded-full",
        lg: "h-14 px-7 text-base rounded-full",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

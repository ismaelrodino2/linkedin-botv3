import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import styles from "./index.module.css";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "destructive" | "outline" | "secondary" | "ghost" | "link" | "icon";
  size?: "sm" | "lg" | "icon";
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      loading = false,
      children,
      disabled,
      variant,
      size,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={`${styles.Button} ${className ? className : ""}`}
        ref={ref}
        disabled={loading || disabled}
        data-variant={variant}
        data-size={size}
        {...props}
      >
        {loading && (
          <Loader2 className={`${styles.Spinner} ${styles.Mr1}`} />
        )}
        <Slottable>{loading ? "Loading..." : children}</Slottable>
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button };
export type { ButtonProps };

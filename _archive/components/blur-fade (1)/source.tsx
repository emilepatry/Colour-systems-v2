import * as React from "react";
import { cx } from "class-variance-authority";
import styles from "./fade.module.css";
import { Logo } from "components";

export function BlurFade() {
  return (
    <div className="relative py-0 [--bg:var(--color-demo-bg)] max-sm:scale-50">
      <Fade
        background="var(--bg)"
        className="w-full h-full"
        side="right"
        blur="6px"
        stop="25%"
      />
      <p className="text-64 flex items-center gap-3">
        <Logo size={40} />
        fadeeeeee
      </p>
    </div>
  );
}

export function Fade({
  stop,
  blur,
  side = "top",
  className,
  background,
  style,
  ref,
  debug,
}: {
  stop?: string;
  blur?: string;
  side: "top" | "bottom" | "left" | "right";
  className?: string;
  background: string;
  debug?: boolean;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={ref}
      aria-hidden
      data-fade
      className={cx(styles.root, className)}
      data-side={side}
      style={
        {
          "--stop": stop,
          "--blur": blur,
          "--background": background,
          ...(debug && {
            outline: "2px solid var(--color-orange)",
          }),
          ...style,
        } as React.CSSProperties
      }
    />
  );
}

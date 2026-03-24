import { CSSProperties } from "react";
import styles from "./grid-line.module.css";

export function GridLines() {
  return (
    <div aria-hidden className="bg-orange-bg relative w-[200px] h-[120px]">
      <GridLine direction="vertical" className="absolute bottom-0 left-0" />
      <GridLine direction="horizontal" className="absolute bottom-0 left-0" />
      <GridLine direction="vertical" className="absolute top-0 right-0" />
      <GridLine direction="horizontal" className="absolute top-0 right-0" />
    </div>
  );
}

export function GridLine({
  direction,
  color,
  className,
  size = 8,
}: {
  direction: "horizontal" | "vertical";
  className?: string;
  color?: string;
  size?: number;
}) {
  return (
    <div
      data-slot="grid-line"
      data-direction={direction}
      className={`${styles.gridLine} ${className}`}
      style={
        {
          "--color": color,
          ...(size && { "--size": `${size}px` }),
        } as CSSProperties
      }
    />
  );
}

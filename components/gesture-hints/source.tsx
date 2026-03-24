import { cx } from "class-variance-authority";
import { motion } from "motion/react";
import { useTheme } from "next-themes";

function Drag({
  x,
  y,
  play = true,
  className,
  size = 40,
}: {
  y?: "up" | "down" | number;
  x?: "left" | "right" | number;
  size?: number;
  play?: boolean;
  className?: string;
}) {
  const { resolvedTheme: theme } = useTheme();

  function getX() {
    if (typeof x === "number") return x;
    if (x === "left") return -32;
    if (x === "right") return 32;
    return 0;
  }

  function getY() {
    if (typeof y === "number") return y;
    if (y === "up") return -32;
    if (y === "down") return 32;
    return 0;
  }

  const x_ = getX();
  const y_ = getY();

  return (
    <motion.div
      key={String(theme)}
      animate={{
        opacity: play ? 1 : 0,
      }}
      transition={{
        duration: 0.25,
        ease: "easeInOut",
      }}
      className={cx(
        "absolute rounded-full pointer-events-none select-none",
        className
      )}
    >
      <motion.div
        animate={{
          ...(y !== undefined && { y: [0, 0, y_, 0] }),
          ...(x !== undefined && { x: [0, 0, x_, 0] }),
          scale: [1, 0.9, 1],
          background: [
            "var(--color-gray-a5)",
            "var(--color-gray-a8)",
            "var(--color-gray-a5)",
          ],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: 1.4,
          ease: "easeInOut",
          duration: 1.2,
        }}
        className="rounded-full"
        style={{
          width: size,
          height: size,
        }}
      />
    </motion.div>
  );
}

function Press({
  play = true,
  className,
}: {
  play?: boolean;
  className?: string;
}) {
  const { resolvedTheme: theme } = useTheme();
  return (
    <motion.div
      key={String(theme)}
      animate={{
        opacity: play ? 1 : 0,
      }}
      transition={{
        duration: 0.25,
        ease: "easeInOut",
      }}
      className={cx(
        "absolute rounded-full pointer-events-none select-none",
        className
      )}
    >
      <motion.div
        animate={{
          scale: [1, 0.85, 1],
          background: [
            "var(--color-gray-a5)",
            "var(--color-gray-a8)",
            "var(--color-gray-a5)",
          ],
        }}
        transition={{
          repeat: Infinity,
          repeatDelay: 1.4,
          ease: "easeInOut",
          duration: 1.2,
        }}
        className={pointer}
      />
    </motion.div>
  );
}

export const Gesture = Object.assign({}, { Drag, Press });

const pointer = "w-10 h-10 bg-gray-a5 rounded-full";

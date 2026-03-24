"use client";

import React from "react";
import { motion, useSpring, PanInfo } from "motion/react";

export const SNAP_DISTANCE = 100;

export const SNAPPED_Y = 216;
export const SNAPPED_WIDTH = 260;
export const SNAPPED_HEIGHT = 140;

export const PADDING = 16;
export const INITIAL_SIZE = 100;
export const SNAPPED_SCALE_X = (SNAPPED_WIDTH - PADDING) / INITIAL_SIZE;
export const SNAPPED_SCALE_Y = (SNAPPED_HEIGHT - PADDING) / INITIAL_SIZE;

// Deceleration is from iOS UIScrollView
export function project(initialVelocity: number, decelerationRate = 0.998) {
  return ((initialVelocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

export function ResponsiveGestures() {
  const [snap, setSnap] = React.useState(false);
  const y = useSpring(0, { damping: 38, stiffness: 550 });

  function onPan(_: PointerEvent, { delta }: PanInfo) {
    y.jump(clamp(y.get() + delta.y, [0, SNAPPED_Y]));
  }

  function onPanEnd(_: PointerEvent, { velocity }: PanInfo) {
    grab.end();

    const projection = y.get() + project(velocity.y);

    if (projection >= SNAP_DISTANCE) {
      setSnap(true);
      y.set(SNAPPED_Y);
    } else {
      y.set(0);
      setSnap(false);
    }
  }

  return (
    <div className="flex-center flex-col gap-24 relative py-4 max-sm:scale-75">
      <motion.div
        onPanStart={grab.start}
        onPan={onPan}
        onPanEnd={onPanEnd}
        style={{ y }}
        animate={{
          scaleX: snap ? SNAPPED_SCALE_X : 1,
          scaleY: snap ? SNAPPED_SCALE_Y : 1,
          background: snap ? "var(--color-yellow)" : "var(--color-orange)",
          transition: {
            type: "spring",
            stiffness: 350,
            damping: 38,
          },
        }}
        className="w-[100px] h-[100px] bg-orange cursor-grab active:cursor-grabbing touch-none z-2 outline-0"
        whileTap={{
          scale: 0.96,
        }}
      />
      <div
        className="pointer-events-none relative border-gray9 bg-gray-a2 border border-dashed"
        style={{
          width: SNAPPED_WIDTH,
          height: SNAPPED_HEIGHT,
        }}
      />
    </div>
  );
}

export function clamp(val: number, [min, max]: [number, number]): number {
  return Math.min(Math.max(val, min), max);
}

export const grab = {
  start: () => document.body.classList.add("gesture-grabbing"),
  end: () => document.body.classList.remove("gesture-grabbing"),
};

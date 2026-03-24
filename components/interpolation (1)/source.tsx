"use client";

import React from "react";
import {
  motion,
  PanInfo,
  useMotionTemplate,
  useSpring,
  useTransform,
} from "motion/react";

export const MARGIN = 16;
export const MAX_BLUR = 12;
export const MAX_OPACITY = 0.2;
export const DISMISS_DISTANCE = 50;

export function Interpolation() {
  const [height, setHeight] = React.useState(0);

  const y = useSpring(0, { damping: 50, stiffness: 550 });

  function onPanStart() {
    grab.start();
  }

  function onPanEnd(_: PointerEvent, { velocity }: PanInfo) {
    grab.end();

    // Reset if rubber banded
    if (y.get() < 0) {
      y.set(0);
      return;
    }

    const projectedY = y.get() + project(velocity.y);

    if (projectedY >= DISMISS_DISTANCE) {
      y.set(height + MARGIN);
    }

    setTimeout(() => {
      y.set(0);
    }, 1000);
  }

  function onPan(_: PointerEvent, { offset }: PanInfo) {
    let newY = offset.y;
    newY = dampen(newY, [0, height]);
    y.jump(newY);
  }

  const blur = useTransform(y, [0, height], [MAX_BLUR, 0]);
  const opacity = useTransform(y, [0, height], [MAX_OPACITY, 0]);

  return (
    <Device>
      <motion.div
        style={{
          filter: useMotionTemplate`blur(${blur}px)`,
        }}
        className="pointer-events-none select-none p-8 flex flex-col gap-8"
      >
        <p className="text-16 leading-32">
          Occaecat Lorem excepteur non quis amet magna eu occaecat irure in
          excepteur ad. Reprehenderit cupidatat commodo laboris. Ea cillum nulla
          qui culpa pariatur ut ea eiusmod non elit cupidatat. Aute Lorem dolor
          amet fugiat velit pariatur.
        </p>
        <p className="text-16 leading-32">
          Voluptate ad dolor quis labore occaecat magna ea officia velit eiusmod
          officia voluptate nisi minim. Pariatur tempor sint amet in fugiat
          cupidatat sunt sit fugiat sint in. Sint incididunt ipsum dolor. Qui
          duis voluptate officia mollit consequat laborum duis voluptate ex.
        </p>
      </motion.div>
      {/* Backdrop */}
      <motion.div
        style={{ opacity }}
        className="w-full h-full absolute top-0 left-0 bg-black"
      />
      {/* Sheet */}
      <motion.div
        onPanStart={onPanStart}
        onPanEnd={onPanEnd}
        onPan={onPan}
        ref={(node) => {
          const bounds = node?.getBoundingClientRect();
          if (bounds) {
            setHeight(bounds.height);
          }
        }}
        className="w-[calc(100%_-_16px)] bg-low-contrast dark:bg-gray3 h-[50%] absolute left-2 bottom-2 rounded-[32px] mt-auto p-4 cursor-grab active:cursor-grabbing max-sm:rounded-16"
        style={
          {
            y,
            "--margin": `${MARGIN}px`,
          } as React.CSSProperties
        }
      >
        <motion.div className="w-10 h-1 bg-gray7 rounded-full mx-auto" />
      </motion.div>
    </Device>
  );
}

export function Device({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[350px] h-[680px] bg-gray3 rounded-[48px] flex flex-col overflow-hidden p-2 shadow-modal max-sm:w-[240px] max-sm:h-[400px] max-sm:rounded-24">
      <div className="bg-white dark:bg-gray1 h-full w-full rounded-[40px] max-sm:rounded-[20px] shadow-border-small relative overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export function project(initialVelocity: number, decelerationRate = 0.998) {
  return ((initialVelocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

function dampen(val: number, [min, max]: [number, number], factor = 2) {
  if (val > max) {
    const extra = val - max;
    const dampenedExtra = extra > 0 ? Math.sqrt(extra) : -Math.sqrt(-extra);
    return max + dampenedExtra * factor;
  } else if (val < min) {
    const extra = val - min;
    const dampenedExtra = extra > 0 ? Math.sqrt(extra) : -Math.sqrt(-extra);
    return min + dampenedExtra * factor;
  } else {
    return val;
  }
}

export const grab = {
  start: () => document.body.classList.add("gesture-grabbing"),
  end: () => document.body.classList.remove("gesture-grabbing"),
};

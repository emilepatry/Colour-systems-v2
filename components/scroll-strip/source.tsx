"use client";

import React from "react";
import Image from "next/image";
import {
  animate,
  motion,
  TargetAndTransition,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import img1 from "./1.jpg";
import img2 from "./2.jpg";
import img3 from "./3.jpg";
import img4 from "./4.jpg";
import img5 from "./5.jpg";
import img6 from "./6.jpg";
import img7 from "./7.jpg";
import img8 from "./8.jpg";
import img9 from "./9.jpg";
import "./scrollend-polyfill.js";
import { useMobileDetect } from "./use-mobile-detect";
import { useEvent } from "./use-event";
import { clamp } from "./clamp";

const SCALE = 1;
export const FRAME_WIDTH = 72 * SCALE;
export const FRAME_WIDTH_EXPANDED = 480 * SCALE;
export const FRAME_HEIGHT = FRAME_WIDTH * 4 * SCALE;
export const FRAME_HEIGHT_EXPANDED = 720 * SCALE;
export const FRAME_WIDTH_DIFF = FRAME_WIDTH_EXPANDED - FRAME_WIDTH;
export const FRAME_HEIGHT_DIFF = FRAME_HEIGHT_EXPANDED - FRAME_HEIGHT;
export const FRAME_GAP = 16;
export const FRAME_DIFF_CENTER = FRAME_WIDTH_DIFF / 2;
export const FRAME_STEP = FRAME_GAP + FRAME_WIDTH;

let FRAMES = [img1, img2, img3, img4, img5, img6, img7, img8, img9];
FRAMES = [...FRAMES, ...FRAMES, ...FRAMES, ...FRAMES];

export default function ScrollStrip() {
  const detect = useMobileDetect();
  const isMobile = detect.isMobile();

  const [activeIndex, setActiveIndex] = React.useState<null | number>(null);
  const { scrollX, scrollY } = useScroll();
  const scrollAxis = React.useRef<"x" | "y" | null>(null);
  const translateX = useMotionValue(0);
  const capturedY = React.useRef(0);
  const carouselRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveIndex(null);
      }
      if (e.key === "ArrowRight") {
        arrow(1)(e);
      }
      if (e.key === "ArrowLeft") {
        arrow(-1)(e);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useMotionValueEvent(scrollX, "change", (x) => {
    if (!scrollAxis.current) {
      document.body.style.overflowY = "hidden";
      scrollAxis.current = "x";
    }
    if (scrollAxis.current === "x") {
      scroll(x);
    }
  });

  useMotionValueEvent(scrollY, "change", (y) => {
    if (!scrollAxis.current) {
      document.body.style.overflowX = "hidden";
      scrollAxis.current = "y";
    }
    if (scrollAxis.current === "y") {
      scroll(y);
    }
  });

  function scroll(position: number) {
    if (capturedY.current === position) return;

    if (translateX.isAnimating()) {
      translateX.stop();
    } else {
      translateX.jump(-position);
      setActiveIndex(null);
    }
  }

  useEvent("scrollend", () => {
    const index = Math.round(
      clamp(-translateX.get() / FRAME_STEP, [0, FRAMES.length - 1])
    );
    setActiveIndex((currentIndex) => {
      if (currentIndex === null) return index;
      return currentIndex;
    });
  });

  useEvent("beforeunload", () => {
    localStorage.setItem("scrollY", String(window.scrollY));
  });

  React.useEffect(() => {
    window.history.scrollRestoration = "manual";
    document.documentElement.scrollTo(0, 0);

    function calc() {
      if (!carouselRef.current) return;
      let scrollableWidth = carouselRef.current.scrollWidth;
      let containerWidth = document.documentElement.clientWidth;

      const carousel = carouselRef.current;
      containerWidth -= carousel.offsetLeft;
      scrollableWidth += carousel.offsetLeft;

      const scrollHeight = scrollableWidth - containerWidth;
      document.body.style.height = `calc(100vh + ${scrollHeight}px)`;
      document.body.style.width = `calc(100vw + ${scrollHeight}px)`;
    }

    calc();

    if (!isMobile) {
      window.addEventListener("resize", calc);
      return () => window.removeEventListener("resize", calc);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  React.useEffect(() => {
    if (activeIndex !== null) {
      const newX = activeIndex * FRAME_STEP;

      capturedY.current = newX;
      if (scrollAxis.current === "x") {
        document.documentElement.scrollLeft = newX;
      } else if (scrollAxis.current === "y" || !scrollAxis.current) {
        document.documentElement.scrollTop = newX;
      }

      animate(translateX, -newX, {
        stiffness: 500,
        damping: 30,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  function arrow(dir: 1 | -1) {
    return (e: KeyboardEvent) => {
      e.preventDefault();
      setActiveIndex((i) => {
        if (i === null) return i;
        const next = i + dir;
        return clamp(next, [0, FRAMES.length - 1]);
      });
    };
  }

  function x(i: number) {
    if (activeIndex === i) {
      return 0;
    }
    if (activeIndex === 0 && i !== 0) {
      return FRAME_DIFF_CENTER;
    }
    if (activeIndex) {
      return i > activeIndex ? FRAME_DIFF_CENTER : -FRAME_DIFF_CENTER;
    }
    return 0;
  }

  return (
    <>
      <div className="relative flex h-[100vh] w-full items-center justify-end">
        <div
          ref={carouselRef}
          className="fixed left-0 flex"
          style={{
            height: FRAME_HEIGHT,
            marginLeft: `calc(50vw - ${FRAME_DIFF_CENTER + FRAME_STEP / 2}px)`,
            // opacity: show ? 1 : 0,
          }}
        >
          <motion.div style={{ x: translateX }}>
            {FRAMES.map((src, i) => {
              const active = activeIndex === i;
              return (
                <Frame
                  key={i}
                  active={active}
                  onClick={() => setActiveIndex(i === activeIndex ? null : i)}
                  animate={{ x: x(i) }}
                  style={{ left: `${i * FRAME_STEP + FRAME_GAP / 2}px` }}
                >
                  <Image
                    alt={`Flower, ${i} of ${FRAMES.length}`}
                    src={src}
                    placeholder="blur"
                    sizes="50vw"
                    className="pointer-events-none h-full w-full object-cover object-center select-none"
                  />
                </Frame>
              );
            })}
          </motion.div>
        </div>
      </div>
    </>
  );
}

interface FrameProps {
  children: React.ReactNode;
  active: boolean;
  animate?: TargetAndTransition;
  style?: React.CSSProperties;
  onClick?: () => void;
}

function Frame({ children, active, animate, style, ...props }: FrameProps) {
  const clip = useSpring(FRAME_DIFF_CENTER, { stiffness: 500, damping: 50 });

  React.useEffect(() => {
    clip.set(active ? 0 : FRAME_DIFF_CENTER);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <motion.div
      initial={false}
      className="ease-swift absolute h-full cursor-pointer grayscale-100 transition-[filter] duration-300 hover:grayscale-0 [&[data-active=true]]:grayscale-0"
      data-active={active}
      animate={{
        height: active ? FRAME_HEIGHT_EXPANDED : FRAME_HEIGHT,
        y: active ? -FRAME_HEIGHT_DIFF / 2 : 0,
        ...animate,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 50,
      }}
      style={{
        width: FRAME_WIDTH_EXPANDED,
        clipPath: useTransform(clip, (c) => `inset(0 ${c}px 0 ${c}px)`),
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

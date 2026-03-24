"use client";

import { motion } from "motion/react";
import React from "react";
import img1 from "./1.jpg";
import img2 from "./2.jpg";
import img3 from "./3.jpg";
import img4 from "./4.jpg";
import img5 from "./5.jpg";
import img6 from "./6.jpg";
import img7 from "./7.jpg";
import Image from "next/image";
import { useShortcuts } from "./use-shortcuts";
import { clamp } from "./clamp";

let IMAGES = [img1, img2, img3, img4, img5, img6, img7];
IMAGES = [...IMAGES, ...IMAGES, ...IMAGES, ...IMAGES, ...IMAGES, ...IMAGES];

const LENGTH = IMAGES.length - 1;
const SNAP_DISTANCE = 50;
const FRAME_OFFSET = -30;
const FRAMES_VISIBLE_LENGTH = 3;

export default function TimeMachine({
  shouldImplementPreloading = false,
}: {
  shouldImplementPreloading?: boolean;
}) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const preloadIndex = FRAMES_VISIBLE_LENGTH + activeIndex;
  const preloadImage = IMAGES[preloadIndex];

  React.useEffect(() => {
    document.body.style.height = `calc(100vh + ${SNAP_DISTANCE * LENGTH}px)`;

    function scroll() {
      const index = clamp(Math.floor(window.scrollY / SNAP_DISTANCE), [
        0,
        LENGTH,
      ]);
      setActiveIndex(index);
    }

    window.addEventListener("scroll", scroll);

    return () => {
      window.removeEventListener("scroll", scroll);
    };
  }, []);

  useShortcuts({
    ArrowRight: () => {
      setActiveIndex((i) => clamp(i + 1, [0, LENGTH]));
    },
    ArrowLeft: () => {
      setActiveIndex((i) => clamp(i - 1, [0, LENGTH]));
    },
  });

  return (
    <div className="fixed translate-center w-full h-[100vh] grid-stack">
      {IMAGES.map((src, index) => {
        const offsetIndex = index - activeIndex;
        const blur = activeIndex > index ? 2 : 0;
        const opacity = activeIndex > index ? 0 : 1;
        const scale = clamp(1 - offsetIndex * 0.08, [0.08, 2]);
        const y = clamp(offsetIndex * FRAME_OFFSET, [
          FRAME_OFFSET * FRAMES_VISIBLE_LENGTH,
          Infinity,
        ]);

        const image = (
          <Image
            alt=""
            src={src}
            className="w-full h-full object-cover"
            placeholder="blur"
            sizes="50vw"
          />
        );

        return (
          <motion.div
            key={index}
            className="w-[100%] max-w-[600px] h-[40%] max-h-[400px] relative border-gray2"
            initial={false}
            animate={{
              y,
              scale,
              transition: {
                type: "spring",
                stiffness: 250,
                damping: 20,
                mass: 0.5,
              },
            }}
            style={{
              borderWidth: 2 / scale,
              willChange: "opacity, filter, transform",
              filter: `blur(${blur}px)`,
              opacity,
              transitionProperty: "opacity, filter",
              transitionDuration: "200ms",
              transitionTimingFunction: "ease-in-out",
              zIndex: IMAGES.length - index,
            }}
          >
            {shouldImplementPreloading ? (
              <>{offsetIndex < FRAMES_VISIBLE_LENGTH ? image : null}</>
            ) : (
              image
            )}
          </motion.div>
        );
      })}
      {shouldImplementPreloading && preloadImage && (
        <Image
          src={IMAGES[FRAMES_VISIBLE_LENGTH + activeIndex]}
          alt=""
          aria-hidden
          placeholder="blur"
          sizes="50vw"
          style={{
            opacity: 0,
            position: "absolute",
          }}
        />
      )}
    </div>
  );
}

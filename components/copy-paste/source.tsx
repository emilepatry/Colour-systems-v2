"use client";

import Image from "next/image";
import React from "react";
import { motion, useSpring } from "motion/react";
import img from "./ocean.jpg";

const SPRING = {
  type: "spring",
  stiffness: 400,
  damping: 40,
  mass: 0.1,
};

export default function CopyPaste({
  slow,
  debug,
}: {
  slow?: boolean;
  debug?: boolean;
}) {
  const speed = 1;

  const referenceRef = React.useRef<HTMLButtonElement | null>(null);

  const [reset, setReset] = React.useState(false);
  const [flash, setFlash] = React.useState(false);
  const [captured, setCaptured] = React.useState(false);

  const mouse = React.useRef({ x: 0, y: 0 });

  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);
  const width = useSpring(0, SPRING);
  const height = useSpring(0, SPRING);

  function setInitialCoordinates() {
    const dimensions = referenceRef?.current?.getBoundingClientRect();
    if (!dimensions) {
      return;
    }
    x.set(dimensions.x);
    y.set(dimensions.y);
    width.set(dimensions.width);
    height.set(dimensions.height);
  }

  function capture() {
    setFlash(true);
    const id = setTimeout(() => {
      setFlash(false);
      setCaptured(true);
      width.set(40);
      height.set(56);
      x.set(mouse.current.x + 16);
      y.set(mouse.current.y + 16);
      clearTimeout(id);
    }, 200);
  }

  function paste() {
    setReset(true);
    setCaptured(false);
  }

  React.useEffect(() => {
    setInitialCoordinates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    function onWindowResize() {
      if (!captured) {
        setInitialCoordinates();
      }
    }

    window.addEventListener("resize", onWindowResize);

    return () => {
      window.removeEventListener("resize", onWindowResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captured]);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        paste();
      }
      if (e.key === "c" && e.metaKey) {
        capture();
      }
      if (e.key === "v" && e.metaKey) {
        paste();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="gap-6 grid-stack h-[100vh]"
      onClick={() => {
        if (captured) {
          paste();
        }
      }}
      onPointerMove={(e) => {
        mouse.current = { x: e.clientX, y: e.clientY };
        const newX = e.clientX + 16;
        const newY = e.clientY + 16;

        if (captured) {
          if (slow) {
            x.jump(newX);
            y.jump(newY);
          } else {
            x.set(newX);
            y.set(newY);
          }
        }
      }}
    >
      <motion.button
        ref={referenceRef}
        className="object-cover cursor-copy data-[disabled=true]:pointer-events-none outline-offset-[6px]"
        data-disabled={captured}
        draggable={false}
        onMouseDown={capture}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        animate={{
          filter: flash
            ? "brightness(1.5) blur(2px)"
            : "brightness(1) blur(0px)",
        }}
        transition={{
          type: "spring",
          stiffness: 600,
          damping: 60,
        }}
      >
        <Image
          alt="Image of ocean in Florianópolis, Brazil"
          className="object-cover pointer-events-none select-none"
          src={img}
          placeholder="blur"
          width="320"
          height="420"
        />
      </motion.button>

      <MotionImage
        alt=""
        key="copy"
        className="fixed select-none transition-[shadow] cursor-copy duration-150 ease-swift inset-0 pointer-events-none"
        aria-hidden
        initial={false}
        animate={{
          opacity: captured ? 1 : 0,
          filter: captured ? "blur(0px)" : "blur(2px)",
        }}
        style={{
          width,
          height,
          x,
          y,
          boxShadow: "var(--shadow-large), 0 0 0 3px white",
        }}
        transition={{
          type: "spring",
          stiffness: 320 / speed,
          damping: 40,
        }}
        src={img}
        draggable={false}
        onAnimationComplete={() => {
          if (reset) {
            setInitialCoordinates();
            setReset(false);
          }
        }}
      />

      {debug && (
        <motion.div
          animate={{ opacity: captured ? 1 : 0 }}
          initial={false}
          transition={{
            duration: 0.2,
            delay: captured ? 0.4 : 0,
          }}
          className="font-mono text-12 fixed max-w-[240px] text-white mix-blend-difference top-0 left-0 mt-14 -mx-8 whitespace-pre"
          style={{
            x,
            y,
          }}
        >
          {JSON.stringify(SPRING, null, 2)}
        </motion.div>
      )}
    </div>
  );
}

const MotionImage = motion(Image);

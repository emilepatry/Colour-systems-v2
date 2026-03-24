import * as React from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
} from "motion/react";

const INITIAL = 100;

export function ConfirmButton({ children = "Hold to delete" }) {
  const clip = useMotionValue(INITIAL);

  function startConfirm() {
    animate(clip, 0, {
      ease: "linear",
      duration: 1,
    });
  }

  function stopConfirm() {
    animate(clip, INITIAL, {
      type: "spring",
      stiffness: 500,
      damping: 50,
    });
  }

  const clipPath = useMotionTemplate`inset(0px ${clip}% 0px 0px round 12px)`;

  return (
    <button
      className="rounded-12 text-24 h-[72px] px-6 py-3 flex-center bg-gray5 hover:bg-gray6 active:bg-gray7 overflow-hidden whitespace-nowrap relative cursor-pointer hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 ease-swift"
      onPointerDown={startConfirm}
      onPointerUp={stopConfirm}
      onMouseLeave={() => {
        stopConfirm();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          startConfirm();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === "Enter") {
          stopConfirm();
        }
      }}
    >
      <span className="flex items-center gap-2 relative w-full user-select-none">
        <IconTrash className="translate-y-[-1px]" />
        <span>{children}</span>
      </span>

      <motion.div
        key="bar"
        aria-hidden
        className="flex-center absolute left-0 top-0 pointer-events-none w-full h-full rounded-12 bg-red text-white"
        style={{ clipPath }}
      >
        <span className="flex items-center gap-2 relative z-2 -nowrap text-white">
          <IconTrash className="translate-y-[-1px]" />
          <span>{children}</span>
        </span>
      </motion.div>
    </button>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg
      width="28px"
      height="28px"
      viewBox="0 0 24 24"
      strokeWidth="2"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color="currentColor"
      className={className}
    >
      <path
        d="M20 9l-1.995 11.346A2 2 0 0116.035 22h-8.07a2 2 0 01-1.97-1.654L4 9M21 6h-5.625M3 6h5.625m0 0V4a2 2 0 012-2h2.75a2 2 0 012 2v2m-6.75 0h6.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

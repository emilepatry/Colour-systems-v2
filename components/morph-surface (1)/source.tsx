"use client";

import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { cx } from "class-variance-authority";
import { useClickOutside } from "./use-click-outside";

const SPEED = 1;

interface FooterContext {
  showFeedback: boolean;
  success: boolean;
  openFeedback: () => void;
  closeFeedback: () => void;
}

const FooterContext = React.createContext({} as FooterContext);
const useFooter = () => React.useContext(FooterContext);

export function MorphSurface() {
  const rootRef = React.useRef<HTMLDivElement>(null);

  const feedbackRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [showFeedback, setShowFeedback, mouse] = useLoop();
  const [success, setSuccess] = React.useState(false);

  function closeFeedback() {
    setShowFeedback(false);
    feedbackRef.current?.blur();
  }

  function openFeedback() {
    setShowFeedback(true);
    setTimeout(() => {
      feedbackRef.current?.focus();
    });
  }

  function onFeedbackSuccess() {
    closeFeedback();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 1500);
  }

  useClickOutside(rootRef, closeFeedback);

  const context = React.useMemo(
    () => ({
      showFeedback,
      success,
      openFeedback,
      closeFeedback,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showFeedback, success]
  );

  return (
    <div
      // TODO move out
      className="flex flex-center items-end"
      style={{
        width: FEEDBACK_WIDTH,
        height: FEEDBACK_HEIGHT,
      }}
      {...mouse}
    >
      <motion.div
        data-footer
        ref={rootRef}
        className={cx(
          "bg-low-contrast dark:bg-gray2 relative flex flex-col items-center bottom-8 max-sm:bottom-5 z-3 shadow-menu overflow-hidden"
        )}
        initial={false}
        animate={{
          width: showFeedback ? FEEDBACK_WIDTH : "auto",
          height: showFeedback ? FEEDBACK_HEIGHT : 44,
          borderRadius: showFeedback ? 14 : 20,
        }}
        transition={{
          type: "spring",
          stiffness: 550 / SPEED,
          damping: 45,
          mass: 0.7,
          delay: showFeedback ? 0 : 0.08,
        }}
      >
        <FooterContext value={context}>
          <Dock />
          <Feedback ref={feedbackRef} onSuccess={onFeedbackSuccess} />
        </FooterContext>
      </motion.div>
    </div>
  );
}

///////////////////////////////////////////////////////////////////////////////////////

function Dock() {
  const { success, showFeedback, openFeedback } = useFooter();
  return (
    <footer className="flex-center select-none whitespace-nowrap mt-auto h-[44px]">
      <div className="flex items-center justify-center gap-6 px-3 max-sm:h-10 max-sm:px-2">
        <div className="flex items-center gap-2 w-fit">
          {showFeedback ? (
            <div className="w-5 h-5" style={{ opacity: 0 }} />
          ) : (
            <motion.div
              className="w-5 h-5 bg-orange rounded-full"
              layoutId="morph-surface-dot"
              transition={LOGO_SPRING}
            >
              <AnimatePresence>
                {success && (
                  <motion.div
                    key="check"
                    exit={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    transition={{
                      type: "spring",
                      stiffness: 500 / SPEED,
                      damping: 22,
                      delay: success ? 0.3 : 0,
                    }}
                    className="m-[2px]"
                  >
                    <IconCheck />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
          <div className="text-14 text-gray12">Morph Surface</div>
        </div>

        <button
          className="button m-[-8px] flex justify-end rounded-full p-2 flex-1 gap-1 -outline-offset-2"
          data-variant="ghost"
          onClick={openFeedback}
        >
          <span className="ml-1 max-w-[20ch] truncate">Feedback</span>
        </button>
      </div>
    </footer>
  );
}

///////////////////////////////////////////////////////////////////////////////////////

const FEEDBACK_WIDTH = 360;
const FEEDBACK_HEIGHT = 200;

function Feedback({
  ref,
  onSuccess,
}: {
  ref: React.Ref<HTMLTextAreaElement>;
  onSuccess: () => void;
}) {
  const { closeFeedback, showFeedback } = useFooter();
  const submitRef = React.useRef<HTMLButtonElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSuccess();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") {
      closeFeedback();
    }
    if (e.key === "Enter" && e.metaKey) {
      e.preventDefault();
      submitRef.current?.click();
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="absolute bottom-0"
      style={{
        width: FEEDBACK_WIDTH,
        height: FEEDBACK_HEIGHT,
        pointerEvents: showFeedback ? "all" : "none",
      }}
    >
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 550 / SPEED,
              damping: 45,
              mass: 0.7,
            }}
            className="p-1 flex flex-col h-full"
          >
            <div className="flex justify-between py-1">
              <p className="flex gap-[6px] text-14 items-center text-gray11 select-none z-2 ml-[25px]">
                Feedback
              </p>
              <button
                type="submit"
                ref={submitRef}
                className="mt-1 flex flex-center gap-1 text-14 -translate-y-[3px] text-gray11 right-4 text-center bg-transparent select-none rounded-[12px] cursor-pointer user-select-none [&>kbd]:text-13! dark:[&>kbd]:bg-gray5! [&>kbd]:rounded-8! pr-1"
              >
                <Kbd>⌘</Kbd>
                <Kbd className="w-fit">Enter</Kbd>
              </button>
            </div>
            <textarea
              ref={ref}
              placeholder="What's on your mind?"
              name="message"
              className="resize-none w-full h-full scroll-py-2 text-16 outline-0 p-4 caret-orange bg-gray2 dark:bg-gray3 rounded-12"
              required
              onKeyDown={onKeyDown}
              spellCheck={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {showFeedback && (
        <motion.div
          layoutId="morph-surface-dot"
          className="w-2 h-2 bg-orange rounded-full absolute top-[18.5px] left-4"
          transition={LOGO_SPRING}
        />
      )}
    </form>
  );
}
///////////////////////////////////////////////////////////////////////////////////////

const LOGO_SPRING = {
  type: "spring",
  stiffness: 350 / SPEED,
  damping: 35,
} as const;

function useLoop(): [
  boolean,
  React.Dispatch<React.SetStateAction<boolean>>,
  {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  },
] {
  const [show, setShow] = React.useState(false);
  const id = React.useRef<number | null>(null);

  function loop() {
    id.current = window.setInterval(() => {
      setShow((prev) => !prev);
    }, 1500);
  }

  React.useEffect(() => {
    loop();
    return () => {
      if (id.current) {
        window.clearInterval(id.current);
      }
    };
  }, []);

  function onMouseEnter() {
    if (id.current) {
      window.clearInterval(id.current);
    }
  }

  function onMouseLeave() {
    loop();
  }

  return [
    show,
    setShow,
    {
      onMouseEnter,
      onMouseLeave,
    },
  ];
}

function IconCheck() {
  return (
    <svg
      width="16px"
      height="16px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color="white"
    >
      <path
        d="M5 13L9 17L19 7"
        stroke="white"
        strokeWidth="2px"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Kbd({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <kbd
      className={cx(
        "w-6 h-6 bg-gray3 text-gray11 rounded-4 flex-center font-sans px-[6px]",
        className
      )}
    >
      {children}
    </kbd>
  );
}

import React, { useEffect } from "react";
import { motion, useSpring } from "motion/react";
import styles from "./checkbox.module.scss";

export function Checkbox({
  label = "Buy groceries",
  initialChecked = false,
}: {
  label?: string;
  initialChecked?: boolean;
}) {
  const [paused, setPaused] = React.useState(false);
  const [checked, setChecked] = React.useState(initialChecked);
  const x = useSpring(0, { stiffness: 300, damping: 30 });

  useInterval(
    () => {
      if (!paused) {
        setChecked((c) => !c);
      }
    },
    1500,
    [paused]
  );

  React.useEffect(() => {
    const ids: number[] = [];

    if (checked) {
      ids.push(
        window.setTimeout(() => {
          x.set(-4);
        }, 400)
      );
      ids.push(
        window.setTimeout(() => {
          x.set(0);
        }, 550)
      );
    } else {
      x.set(0);
    }

    return () => {
      ids.forEach(clearTimeout);
    };
  }, [checked]);

  return (
    <div
      className="w-full h-full flex-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center gap-3 transition-[background] ease-in-out duration-150 hover:bg-gray4 p-2 rounded-8 relative">
        <div className={styles.checkbox} data-checked={checked}>
          <svg
            viewBox="0 0 21 21"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186" />
          </svg>
        </div>
        <motion.div className="relative" style={{ x }}>
          <p className="text-16 text-gray12">{label}</p>
          <motion.div
            animate={{ width: checked ? "100%" : 0 }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 20,
              mass: 0.1,
              delay: checked ? 0.2 : 0,
            }}
            className="w-full h-[1px] bg-gray12 absolute translate-center-y"
          />
        </motion.div>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="w-full h-full appearance-none absolute inset-0 rounded-8 cursor-pointer"
        />
      </div>
    </div>
  );
}

function useInterval(callback: () => void, delay: number, deps: any[] = []) {
  useEffect(() => {
    if (!delay) {
      return;
    }

    const id = setInterval(() => {
      callback();
    }, delay);

    return () => {
      clearInterval(id);
    };
  }, [callback, delay, ...deps]);
}

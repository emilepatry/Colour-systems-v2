import { useEffect, useRef, useState } from "react";
import * as React from "react";
import styles from "./source.module.css";

interface Props extends React.ComponentProps<"button"> {
  issueCount: number;
  collapsible?: boolean;
}

export const SHORT_DURATION_MS = 150;
export const COUNT_DURATION_MS = 450;
export const SIZE = 36;

export default function NextBadge({
  issueCount,
  collapsible = true,
  ...props
}: Props) {
  const hasError = issueCount > 0;
  const [isErrorExpanded, setIsErrorExpanded] = useState(hasError);

  const [animateBounce, setAnimateBounce] = useUpdateAnimation(
    issueCount,
    SHORT_DURATION_MS
  );

  const [animateCount] = useUpdateAnimation(issueCount, COUNT_DURATION_MS);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const measuredWidth = useMeasureWidth(ref);

  const width = measuredWidth ? measuredWidth : "auto";

  const innerRef = useRef<HTMLDivElement | null>(null);
  const innerMeasuredWidth = useMeasureWidth(innerRef);

  useEffect(() => {
    setIsErrorExpanded(issueCount > 0);
  }, [issueCount]);

  function collapse() {
    if (!collapsible) return;
    setIsErrorExpanded(false);
    // Move focus to the trigger to prevent having it stuck on this element
    triggerRef.current?.focus();
  }

  return (
    <div
      className={styles.root}
      style={
        {
          "--size": `${SIZE}px`,
          "--duration-short": `${SHORT_DURATION_MS}ms`,
        } as React.CSSProperties
      }
    >
      <div
        className={styles.badge}
        data-error={hasError}
        data-error-expanded={isErrorExpanded}
        data-animate={animateBounce}
        onTransitionEnd={() => setAnimateBounce(false)}
        style={{ width }}
      >
        <div ref={ref}>
          {/* Children */}
          <button
            ref={triggerRef}
            className={styles.mark}
            onClick={() => {}}
            {...props}
          >
            <NextMark />
          </button>
          {isErrorExpanded && (
            <div className={styles.issues}>
              <button
                className={styles.open}
                aria-label="Open issues overlay"
                onClick={() => {}}
                style={{
                  width: innerMeasuredWidth ? innerMeasuredWidth : "auto",
                }}
              >
                <div className="flex items-center gap-[2px]">
                  <AnimateCount
                    // Used the key to force a re-render when the count changes.
                    key={issueCount}
                    animate={animateCount && issueCount > 1}
                    className={styles.count}
                  >
                    {issueCount}
                  </AnimateCount>{" "}
                  <div>
                    Issue
                    {issueCount > 1 && "s"}
                  </div>
                </div>
              </button>
              <button
                className={styles.collapse}
                aria-label="Collapse issues badge"
                onClick={collapse}
              >
                <Cross className={styles.cross} />
              </button>
            </div>
          )}
        </div>
      </div>
      <div aria-hidden className={styles.dot} />
    </div>
  );
}

export function AnimateCount({
  children: count,
  animate = true,
  className,
}: {
  children: number;
  animate: boolean;
  className?: string;
}) {
  return (
    <div className={className} data-animate={animate}>
      {animate && (
        <div aria-hidden className={styles.exit}>
          {count - 1}
        </div>
      )}
      <div className={styles.enter}>{count}</div>
    </div>
  );
}

export function useMeasureWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    const el = ref.current;

    if (!el) {
      return;
    }

    const observer = new ResizeObserver(() => {
      const { width: w } = el.getBoundingClientRect();
      setWidth(w);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

export function useUpdateAnimation(
  issueCount: number,
  animationDurationMs = 0
): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
  const lastUpdatedTimeStamp = useRef<number | null>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (issueCount > 0) {
      const deltaMs = lastUpdatedTimeStamp.current
        ? Date.now() - lastUpdatedTimeStamp.current
        : -1;
      lastUpdatedTimeStamp.current = Date.now();

      // We don't animate if `issueCount` changes too quickly
      if (deltaMs <= animationDurationMs) {
        setAnimate(false);
        return;
      }

      setAnimate(true);
    }
  }, [issueCount, animationDurationMs]);

  return [animate, setAnimate];
}

export function NextMark() {
  const id = React.useId();
  const clipPathId = `${id}-clip`;
  const linearGradientId1 = `${id}-paint0-linear`;
  const linearGradientId2 = `${id}-paint1-linear`;

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        translate: "-0.5px",
      }}
    >
      <g clipPath={`url(#${clipPathId})`}>
        <path
          d="M17.2571 18.5026L4.75568 2.39941H2.40027V13.5947H4.2846V4.79242L15.7779 19.642C16.2965 19.2949 16.7906 18.914 17.2571 18.5026Z"
          fill={`url(#${linearGradientId1})`}
        />
        <rect
          x="11.8892"
          y="2.39941"
          width="1.86667"
          height="11.2"
          fill={`url(#${linearGradientId2})`}
        />
      </g>
      <defs>
        <linearGradient
          id={linearGradientId1}
          x1="10.9558"
          y1="12.1216"
          x2="16.478"
          y2="18.9661"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="0.604072" stopColor="white" stopOpacity="0" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id={linearGradientId2}
          x1="12.8225"
          y1="2.39941"
          x2="12.7912"
          y2="10.6244"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <clipPath id={clipPathId}>
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function Cross(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.08889 11.8384L2.62486 12.3024L1.69678 11.3744L2.16082 10.9103L6.07178 6.99937L2.16082 3.08841L1.69678 2.62437L2.62486 1.69629L3.08889 2.16033L6.99986 6.07129L10.9108 2.16033L11.3749 1.69629L12.3029 2.62437L11.8389 3.08841L7.92793 6.99937L11.8389 10.9103L12.3029 11.3744L11.3749 12.3024L10.9108 11.8384L6.99986 7.92744L3.08889 11.8384Z"
        fill="currentColor"
      />
    </svg>
  );
}

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cx } from "class-variance-authority";
import { getRandomColor, getUnit, hash } from "./utils";
import styles from "./avatar.module.css";

const DEFAULT_SIZE = 40;
const DEFAULT_FALLBACK_DELAY_MS = 500;

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
  size?: number;
  fallbackDelayMs?: number;
}

export function AvatarFallbackExamples() {
  return (
    <div className="flex gap-4 py-4">
      <Avatar.Fallback size={60}>Rauno Freiberg</Avatar.Fallback>
      <Avatar.Fallback size={60}>John Doe 9</Avatar.Fallback>
      <Avatar.Fallback size={60}>Thomas Wilkinson</Avatar.Fallback>
      <Avatar.Fallback size={60}>Robert Demure 3</Avatar.Fallback>
    </div>
  );
}

export const AvatarImpl = React.forwardRef<HTMLDivElement, AvatarProps>(
  function Avatar(
    {
      children,
      src,
      alt,
      size = DEFAULT_SIZE,
      fallbackDelayMs = DEFAULT_FALLBACK_DELAY_MS,
      className,
      style,
      ...rest
    },
    ref
  ) {
    return (
      <AvatarPrimitive.Root
        ref={ref}
        className={cx(styles.root, className)}
        style={{
          ...style,
          ["--size" as string]: `${size}px`,
        }}
        {...rest}
      >
        <AvatarPrimitive.Image asChild={!!children} src={src} alt={alt}>
          {children}
        </AvatarPrimitive.Image>
        <AvatarPrimitive.Fallback asChild delayMs={fallbackDelayMs}>
          <Fallback>{alt}</Fallback>
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
    );
  }
);

// const colors = ["#FFAD08", "#EDD75A", "#74B06F"];
const colors = ["#F6C750", "#E63525", "#050D4C", "#D4EBEE"];
// const colors = ["#F6C750", "#E63525", "#E87D58"];

function Fallback({
  children,
  size = DEFAULT_SIZE,
}: {
  children: string;
  size?: number;
  className?: string;
}) {
  const titleId = React.useId();
  const properties = generateColors(children, colors);

  const maskId = React.useId();
  const filterId = React.useId();

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      role="img"
      aria-describedby={titleId}
      width={size}
      height={size}
    >
      <mask
        id={maskId}
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={size}
        height={size}
      >
        <rect width={size} height={size} rx={size * 2} fill="#FFFFFF" />
      </mask>
      <g mask={`url(#${maskId})`}>
        <rect width={size} height={size} fill={properties[0].color} />
        <path
          filter={`url(#${filterId})`}
          d="M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z"
          fill={properties[1].color}
          transform={`
            translate(${properties[1].translateX} ${properties[1].translateY})
            rotate(${properties[1].rotate} ${size / 2} ${size / 2})
            scale(${properties[1].scale})
          `}
        />
        <path
          filter={`url(#${filterId})`}
          style={{
            mixBlendMode: "overlay",
          }}
          d="M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z"
          fill={properties[2].color}
          transform={`
            translate(${properties[2].translateX} ${properties[2].translateY})
            rotate(${properties[2].rotate} ${size / 2} ${size / 2})
            scale(${properties[2].scale})
          `}
        />
      </g>
      <defs>
        <filter
          id={filterId}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation={7} result="effect1_foregroundBlur" />
        </filter>
      </defs>
    </svg>
  );
}

export function generateColors(name: string, colors: string[]) {
  const numFromName = hash(name);
  const range = colors && colors.length;

  const elementsProperties = Array.from({ length: 3 }, (_, i) => ({
    color: getRandomColor(numFromName + i, colors, range),
    translateX: getUnit(numFromName * (i + 1), DEFAULT_SIZE / 10, 1),
    translateY: getUnit(numFromName * (i + 1), DEFAULT_SIZE / 10, 2),
    scale: 1.2 + getUnit(numFromName * (i + 1), DEFAULT_SIZE / 20) / 10,
    rotate: getUnit(numFromName * (i + 1), 360, 1),
  }));

  return elementsProperties;
}

export const Avatar = Object.assign(AvatarImpl, { Fallback });

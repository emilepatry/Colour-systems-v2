import styles from "./source.module.scss";

const DEFAULT_BLUR = 10;
const DEFAULT_DURATION = 2000;

export function BlurReveal({
  children,
  duration = DEFAULT_DURATION,
  blur = DEFAULT_BLUR,
}: {
  children: React.ReactNode;
  blur?: number;
  duration?: number;
}) {
  return (
    <div
      className={styles.root}
      style={
        {
          "--duration-clip": duration + "ms",
          "--duration": duration + duration / 2 + "ms",
          "--blur": blur + "px",
        } as React.CSSProperties
      }
    >
      <div className={styles.banner}>{children}</div>
      <Effects />
    </div>
  );
}

function Effects() {
  return (
    <div className="grid-stack absolute inset-0 -ml-8">
      <div aria-hidden className={styles.blur}></div>
      <svg className={styles.noise}>
        <filter id="noise">
          <feTurbulence
            baseFrequency="1"
            numOctaves="4"
            stitchTiles="stitch"
            type="fractalNoise"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect filter="url(#noise)" height="100%" width="100%" />
      </svg>
    </div>
  );
}

export function BlurRevealContents() {
  return (
    <div className="flex items-center gap-4 text-24">
      <div className="flex items-center gap-2">
        <div className="w-[18px] h-[18px] bg-orange rounded-full" />
        <span>Devouring Details</span>
      </div>
      <div className="bg-orange px-1 text-white text-16 flex items-center px-4 h-[36px] rounded-full">
        Register Now
      </div>
    </div>
  );
}

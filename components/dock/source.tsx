import * as React from "react";
import Image from "next/image";
import useMeasure from "react-use-measure";
import { motion, PanInfo, useSpring, useTransform } from "motion/react";
import imgImessage from "./messages.png";
import imgSafari from "./safari.png";
import imgMusic from "./music.png";
import imgStore from "./store.png";
import imgFitness from "./fitness.png";
import imgPhotos from "./photos.png";
import imgNotes from "./notes.png";
import styles from "./dock.module.css";

const HEIGHT = 94;
const SPRING = {
  type: "spring",
  stiffness: 350,
  damping: 34,
  mass: 1,
} as const;
const SNAP_POINT = 70;

export function Dock() {
  const [ref, bounds] = useMeasure();
  const [collapse, setCollapse] = React.useState(false);

  const y = useSpring(0, { stiffness: 200, damping: 20, mass: 0.4 });
  const clip = useSpring(0, SPRING);

  React.useEffect(() => {
    const clipV = (bounds.width - HEIGHT) / 2;
    clip.set(collapse ? clipV : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapse, bounds.width]);

  function onPan(_: PointerEvent, { offset }: PanInfo) {
    const damping = collapse ? 1 : 0.5;
    const newY = offset.y * damping;

    y.set(newY);

    if (Math.abs(offset.y) > SNAP_POINT) {
      if (!collapse) {
        setCollapse(true);
      }
    }
  }

  function onPanEnd() {
    y.set(0);
    setCollapse(false);
    grab.end();
  }

  return (
    <motion.div
      ref={ref}
      onPanStart={grab.start}
      onPan={onPan}
      onPanEnd={onPanEnd}
      className={`${styles.root} bg-gray-a4 relative flex cursor-grab active:cursor-grabbing gap-[18px] overflow-hidden px-[26px] py-[17px] backdrop-blur-[12px] [&>img]:pointer-events-none [&>img]:select-none touch-none`}
      style={{
        clipPath: useTransform(
          clip,
          (c) => `inset(0 ${c}px 0 ${c}px round 31px)`
        ),
        y,
        height: HEIGHT,
      }}
      transition={SPRING}
    >
      {apps.map((app, index) => {
        return <Image alt="" key={index} src={app} width={60} height={60} />;
      })}
    </motion.div>
  );
}

const apps = [
  imgImessage,
  imgSafari,
  imgMusic,
  imgStore,
  imgFitness,
  imgPhotos,
  imgNotes,
];

const grab = {
  start: () => document.body.classList.add("gesture-grabbing"),
  end: () => document.body.classList.remove("gesture-grabbing"),
};

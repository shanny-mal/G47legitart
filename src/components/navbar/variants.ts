import type { Variants } from "framer-motion";

export const logoFloatVariant = (reduceMotion: boolean): Variants =>
  reduceMotion
    ? {}
    : {
        animate: {
          y: [0, -4, 0],
          transition: {
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        },
      };

export const mobileMenuVariants: Variants = {
  hidden: { opacity: 0, y: -8, scale: 0.995 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 280, damping: 30 },
  },
  exit: { opacity: 0, y: -6, transition: { duration: 0.14 } },
};

export const linksContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

export const linkItemVariants: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.26 } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.12 } },
};

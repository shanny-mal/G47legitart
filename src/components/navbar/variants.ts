import type { Variants } from "framer-motion";

export const menuVariants: Variants = {
  closed: { opacity: 0, y: -8, transition: { duration: 0.18 } },
  open: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 28 },
  },
};

export const linkItemVariants: Variants = {
  closed: { opacity: 0, y: -6 },
  open: { opacity: 1, y: 0, transition: { duration: 0.22 } },
};

export const logoFloat = (reduced: boolean): Partial<Variants> =>
  reduced
    ? {}
    : {
        animate: {
          y: [0, -3, 0],
          transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
        },
      };

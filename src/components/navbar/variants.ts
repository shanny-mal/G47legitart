import type { Variants } from "framer-motion";

export const menuVariants: Variants = {
  closed: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.18 },
  },
  open: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 26,
      when: "beforeChildren",
      staggerChildren: 0.06,
    },
  },
};

export const linkItemVariants: Variants = {
  closed: { opacity: 0, y: -6 },
  open: { opacity: 1, y: 0, transition: { duration: 0.22 } },
};

export const logoFloat = (reduced = false): Partial<Variants> =>
  reduced
    ? {}
    : {
        animate: {
          y: [0, -3, 0],
          transition: { duration: 3.8, repeat: Infinity, ease: "easeInOut" },
        },
      };

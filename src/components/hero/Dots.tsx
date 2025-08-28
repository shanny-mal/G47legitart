import { motion } from "framer-motion";

export default function Dots({
  count,
  active,
  onSelect,
  className = "",
}: {
  count: number;
  active: number;
  onSelect: (i: number) => void;
  className?: string;
}) {
  return (
    <div
      className={`flex gap-3 items-center justify-center ${className}`}
      role="tablist"
      aria-label="Hero slides"
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`Go to slide ${i + 1}`}
          aria-current={i === active ? "true" : undefined}
          initial={false}
          whileHover={{ scale: 1.16 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          className={`rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/30 transition-all
            ${i === active ? "w-4 h-4 md:w-4 md:h-4 bg-gradient-to-r from-karibaTeal to-karibaCoral shadow-lg" 
                          : "w-3.5 h-3.5 md:w-3.5 md:h-3.5 bg-white/30 hover:bg-white/60"}`}
        />
      ))}
    </div>
  );
}

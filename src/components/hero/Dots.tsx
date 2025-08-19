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
    <div className={`flex gap-3 items-center justify-center ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`Go to slide ${i + 1}`}
          aria-current={i === active ? "true" : undefined}
          initial={false}
          whileHover={{ scale: 1.18 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className={`w-3.5 h-3.5 rounded-full focus:outline-none ring-offset-2 ring-2 ring-transparent ${
            i === active
              ? "bg-gradient-to-r from-karibaTeal to-karibaCoral shadow-lg"
              : "bg-white/30 hover:bg-white/50"
          }`}
        />
      ))}
    </div>
  );
}

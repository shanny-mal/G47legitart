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
    <div className={`flex gap-2 items-center justify-center ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`Go to slide ${i + 1}`}
          aria-current={i === active ? "true" : undefined}
          initial={false}
          whileHover={{ scale: 1.25 }}
          whileTap={{ scale: 0.95 }}
          className={`w-3 h-3 rounded-full focus:outline-none ${
            i === active ? "bg-white" : "bg-white/50"
          }`}
        />
      ))}
    </div>
  );
}

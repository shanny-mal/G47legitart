import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import kmlogo from "../../assets/images/logos/kmlogo.jpg";
import { logoFloatVariant } from "./variants";

type Props = { title?: string };

const Logo: React.FC<Props> = React.memo(({ title = "TheKaribaMagazine" }) => {
  // normalize to boolean to satisfy TS (some lib versions may return boolean | null)
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <a
      href="/"
      aria-label={`${title} home`}
      className="flex items-center gap-3 focus:outline-none"
    >
      <motion.div
        {...(reduceMotion ? {} : (logoFloatVariant(false) as any))}
        className="w-12 h-12 rounded-md overflow-hidden bg-white/5 dark:bg-white/2 flex items-center justify-center shadow-sm"
        title={title}
        aria-hidden="false"
      >
        <img
          src={kmlogo}
          alt={`${title} logo`}
          loading="lazy"
          decoding="async"
          // use camelCase prop name so TS accepts it
          fetchPriority="low"
          width={48}
          height={48}
          className="w-full h-full object-cover"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            img.style.display = "none";
            // no return value (void)
          }}
        />
      </motion.div>

      <span className="font-serif text-lg text-karibaNavy dark:text-karibaSand select-none">
        {title}
      </span>
    </a>
  );
});

Logo.displayName = "Logo";
export default Logo;

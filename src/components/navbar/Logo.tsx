import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import kmlogo from "../../assets/images/logos/kmlogo.jpg";
import { logoFloat } from "./variants";

const Logo: React.FC<{ title?: string }> = React.memo(
  ({ title = "KaribaMagazine" }) => {
    const reduceMotion = Boolean(useReducedMotion());
    return (
      <a
        href="/"
        aria-label={`${title} home`}
        className="flex items-center gap-3 focus:outline-none"
      >
        <motion.div
          {...(reduceMotion ? {} : (logoFloat(false) as any))}
          className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-white/6 dark:bg-white/4 shadow-sm transition-transform duration-300 hover:scale-105"
          title={title}
          aria-hidden="true"
        >
          <img
            src={kmlogo}
            alt={`${title} logo`}
            loading="lazy"
            decoding="async"
            width={48}
            height={48}
            className="w-full h-full object-cover"
            onError={(e) =>
              ((e.currentTarget as HTMLImageElement).style.display = "none")
            }
          />
        </motion.div>

        <span className="font-serif text-lg font-semibold text-karibaNavy dark:text-karibaSand select-none">
          {title}
        </span>
      </a>
    );
  }
);
Logo.displayName = "Logo";
export default Logo;

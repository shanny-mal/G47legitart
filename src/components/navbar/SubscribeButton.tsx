import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

const SubscribeButton: React.FC<{ className?: string }> = React.memo(
  ({ className = "" }) => {
    const reduceMotion = Boolean(useReducedMotion());

    return (
      <motion.div
        whileTap={reduceMotion ? {} : { scale: 0.98 }}
        className={className}
      >
        <Link
          to="/subscribe"
          className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-karibaTeal to-karibaCoral text-black rounded-full font-semibold shadow-lg
                   hover:-translate-y-0.5 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-karibaCoral/40 transition-transform duration-200"
          aria-label="Subscribe"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M3 8l9 6 9-6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 16v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm">Subscribe</span>
        </Link>
      </motion.div>
    );
  }
);
SubscribeButton.displayName = "SubscribeButton";
export default SubscribeButton;

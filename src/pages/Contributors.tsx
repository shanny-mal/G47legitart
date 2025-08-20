// src/components/Contributors.tsx
import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  FaTwitter,
  FaInstagram,
  FaLink,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

/**
 * If you already have contributor images, import them here and
 * point sample data avatarUrl to them:
 *
 * import Contrib1 from "../assets/images/contributors/contrib1.jpg";
 * import Contrib2 from "../assets/images/contributors/contrib2.jpg";
 *
 * For this example I'll import a placeholder image that you should
 * replace with your real contributor photo file(s).
 */
import ContribPlaceholder from "../assets/images/contributors/contrib1.jpg";

type Contributor = {
  id: string;
  name: string;
  role: string;
  location?: string;
  bio?: string;
  /** full-bleed contributor image (landscape/rectangular) */
  avatarUrl?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  website?: string | null;
  email?: string | null;
};

const SAMPLE: Contributor[] = [
  {
    id: "c1",
    name: "R. Kasiyabvumba",
    role: "Editor, writer and designe",
    location: "Kariba",
    bio: "Investigative reporter focused on water, communities and climate resilience.",
    twitter: "#",
    avatarUrl: ContribPlaceholder,
  },
];

/* -------------------------
   Small helper components
   ------------------------- */

/** A rectangular contributor image display (not a circular avatar) */
const ImageCard: React.FC<{
  src?: string | null;
  alt?: string;
  credit?: string | null;
}> = ({ src, alt = "", credit = null }) => {
  // show placeholder if no src provided
  const imgSrc = src ?? ContribPlaceholder;
  return (
    <div className="w-28 sm:w-32 lg:w-36 flex-shrink-0 relative rounded-md overflow-hidden bg-gray-100 ring-1 ring-slate-100">
      <img
        src={imgSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105"
      />
      {credit && (
        <div className="absolute left-2 bottom-2 rounded px-2 py-0.5 bg-black/50 text-xs text-white/90 backdrop-blur-sm">
          {credit}
        </div>
      )}
    </div>
  );
};

const SocialIcon: React.FC<{
  href?: string | null;
  children: React.ReactNode;
  label?: string;
}> = ({ href, children, label }) => {
  if (!href) {
    return <div className="opacity-40">{children}</div>;
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-white/6 hover:bg-white/10 transition"
    >
      {children}
    </a>
  );
};

/* -------------------------
   Main Contributors component
   ------------------------- */

const Contributors: React.FC = () => {
  const contributors = useMemo(() => SAMPLE, []);
  const reduce = useReducedMotion();

  return (
    <section
      className="py-14"
      aria-labelledby="contributors-heading"
      style={{
        background:
          "linear-gradient(180deg, rgba(249,250,251,0.9) 0%, rgba(245,247,250,1) 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2
              id="contributors-heading"
              className="text-3xl font-serif font-semibold text-slate-900"
            >
              Contributors
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-xl">
              We work with journalists, photographers and visual storytellers
              across the region. Interested in contributing? Get in touch below.
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 text-white font-medium shadow hover:brightness-95 transition"
            >
              Become a contributor
            </a>
            <a
              href="/contributors"
              className="text-sm text-slate-700 hover:underline"
            >
              View all
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {contributors.map((c, idx) => (
            <motion.article
              key={c.id}
              initial={reduce ? undefined : { opacity: 0, y: 8 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.36, delay: idx * 0.05 }}
              whileHover={
                reduce
                  ? undefined
                  : {
                      translateY: -6,
                      boxShadow: "0 18px 40px rgba(2,6,23,0.08)",
                    }
              }
              className="relative overflow-hidden rounded-2xl p-4 bg-white shadow-sm border border-slate-100 flex gap-4 items-start"
              aria-label={`${c.name} — ${c.role}`}
            >
              {/* decorative accent */}
              <div className="absolute -left-5 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-400 to-teal-300 opacity-90 rounded-r-full" />

              {/* Image (rectangular) */}
              <ImageCard
                src={c.avatarUrl}
                alt={`${c.name} — ${c.role}`}
                credit={c.location ?? null}
              />

              {/* Text content */}
              <div className="flex-1 relative z-10">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-slate-900">
                      {c.name}
                    </h3>
                    <div className="text-sm text-slate-600 mt-0.5">
                      {c.role}
                    </div>
                    {c.location && (
                      <div className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                        <FaMapMarkerAlt className="w-3 h-3" />
                        <span>{c.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="ml-2 flex items-center gap-2">
                    <SocialIcon href={c.twitter} label={`${c.name} on Twitter`}>
                      <FaTwitter className="w-4 h-4 text-slate-700" />
                    </SocialIcon>

                    <SocialIcon
                      href={c.instagram}
                      label={`${c.name} on Instagram`}
                    >
                      <FaInstagram className="w-4 h-4 text-slate-700" />
                    </SocialIcon>

                    <SocialIcon href={c.website} label={`${c.name} website`}>
                      <FaLink className="w-4 h-4 text-slate-700" />
                    </SocialIcon>
                  </div>
                </div>

                {c.bio && (
                  <p className="mt-3 text-sm text-slate-700">{c.bio}</p>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <a
                    href={`/contributors/${c.id}`}
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    Profile
                  </a>

                  {c.email && (
                    <a
                      href={`mailto:${c.email}`}
                      className="ml-auto inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/6 hover:bg-white/10 transition text-sm"
                    >
                      <FaEnvelope className="w-3.5 h-3.5 text-slate-700" />
                      <span>Contact</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(Contributors);

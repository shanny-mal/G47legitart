// src/components/About.tsx
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import AboutBg from "../assets/images/about/aboutbg.png";

/* ---------------------------
   Small presentational pieces
   --------------------------- */

const SectionTitle: React.FC<{ eyebrow?: string; title: React.ReactNode }> = ({
  eyebrow,
  title,
}) => (
  <div className="mb-4">
    {eyebrow && (
      <p className="text-sm text-karibaTeal font-medium uppercase tracking-wide">
        {eyebrow}
      </p>
    )}
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-karibaNavy dark:text-karibaSand leading-tight">
      {title}
    </h2>
  </div>
);

/**
 * Stat now uses "text-current" so the parent container decides the color.
 * This lets us set `text-black` on the container to produce black text,
 * while other uses can keep white by using a parent with `text-white`.
 */
const Stat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-start">
    <div className="text-2xl sm:text-3xl font-bold text-current">{value}</div>
    <div className="text-xs sm:text-sm text-current opacity-80">{label}</div>
  </div>
);

const Feature: React.FC<{ title: string; body: string }> = ({
  title,
  body,
}) => (
  <article className="bg-white/6 dark:bg-white/4 rounded-lg p-4 shadow-sm border border-white/6">
    <h4 className="font-semibold text-karibaNavy dark:text-karibaSand">
      {title}
    </h4>
    <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">{body}</p>
  </article>
);

/* ---------------------------
   Main About component
   --------------------------- */

const About: React.FC = () => {
  const features = useMemo(
    () => [
      {
        title: "Storytelling that matters",
        body: "Investigative features, long-form essays and photojournalism — crafted to inform and inspire.",
      },
      {
        title: "Visual-first approach",
        body: "Photo essays and thoughtfully designed layouts that celebrate photography and illustration.",
      },
      {
        title: "Community-driven",
        body: "Writers, photographers and readers contribute — share your story and join the conversation.",
      },
    ],
    []
  );

  return (
    <section className="py-12 bg-gray-50 dark:bg-[#05232b]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Header + narrative */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SectionTitle
                eyebrow="About"
                title={
                  <>
                    The <span className="text-karibaTeal">Kariba</span> Magazine
                  </>
                }
              />

              <p className="mt-4 text-gray-700 dark:text-gray-200 leading-relaxed text-base sm:text-lg">
                Welcome to <strong>The Kariba Magazine</strong>. We believe in
                the power of storytelling to connect communities, inspire
                curiosity, and shine light on the people and places of the
                Kariba basin. We are a collective of journalists, photographers,
                designers and readers who value depth, craft and truth.
              </p>

              <div className="mt-6 space-y-4">
                <p className="text-gray-700 dark:text-gray-200">
                  <strong>What we stand for</strong> — independent, courageous
                  reporting that centers local voices; beautiful visual work
                  that respects its subjects; and editorial care that
                  prioritizes nuance over noise.
                </p>

                <p className="text-gray-700 dark:text-gray-200">
                  <strong>Join us</strong> — read deeply, share widely and
                  consider contributing. Whether you are a photographer, writer
                  or reader, your perspective helps build a richer picture of
                  the region we cover.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right: features, stats and a featured card */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06, duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {features.map((f) => (
                <Feature key={f.title} title={f.title} body={f.body} />
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.995 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12, duration: 0.5 }}
              className="mt-6 p-5 rounded-xl bg-gradient-to-b from-white/6 to-white/3 ring-1 ring-white/8 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-black/80">Featured</div>
                  <div className="mt-2 text-lg font-semibold text-black">
                    Season highlights — visual stories
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-black/70">Issues</div>
                  <div className="text-2xl font-bold text-black">29</div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="w-24 h-14 rounded-md bg-gradient-to-br from-karibaTeal to-karibaCoral shadow-inner flex items-center justify-center text-white font-bold">
                  <img src={AboutBg} alt="" />
                </div>

                <div className="flex-1">
                  <div className="text-sm text-black/90">
                    Photo essays, in-depth reporting and interviews from the
                    Kariba basin.
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                {/* These two stat cards now use text-black so value & label render in black */}
                <div className="p-4 rounded-lg bg-white/6 dark:bg-white/4 text-black">
                  <Stat value="120+" label="Published stories" />
                </div>
                <div className="p-4 rounded-lg bg-white/6 dark:bg-white/4 text-black">
                  <Stat value="30+" label="Contributors" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

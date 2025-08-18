import React from "react";

const services = [
  {
    title: "Editorial & Copyediting",
    desc: "Professional editing for long-form features, copy and headlines",
    icon: "✍️",
  },
  {
    title: "Layout & Typesetting",
    desc: "Magazine-grade layout for digital and print",
    icon: "📐",
  },
  {
    title: "Photo Editing",
    desc: "Color grading, retouching and restoration",
    icon: "📷",
  },
  {
    title: "Advertising Packages",
    desc: "Sponsored content and banner placements",
    icon: "📣",
  },
];

const Services: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50 dark:bg-[#072231]">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((s) => (
          <article
            key={s.title}
            className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition"
          >
            <div className="text-4xl">{s.icon}</div>
            <h3 className="mt-4 font-semibold text-lg">{s.title}</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {s.desc}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Services;

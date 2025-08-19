import React from "react";

const Contributors: React.FC = () => {
  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-serif">Contributors</h1>
        <p className="mt-4 text-gray-700 dark:text-gray-300">
          We work with journalists, photographers and writers from the region.
          Interested in contributing? Contact us.
        </p>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <article className="p-4 bg-white dark:bg-gray-800 rounded shadow">
            <h3 className="font-semibold">Name One</h3>
            <p className="text-sm mt-2">
              Feature writer — environmental issues
            </p>
          </article>

          <article className="p-4 bg-white dark:bg-gray-800 rounded shadow">
            <h3 className="font-semibold">Name Two</h3>
            <p className="text-sm mt-2">
              Photojournalist — documentary photography
            </p>
          </article>

          <article className="p-4 bg-white dark:bg-gray-800 rounded shadow">
            <h3 className="font-semibold">Name Three</h3>
            <p className="text-sm mt-2">Illustrator — magazine artwork</p>
          </article>
        </div>
      </div>
    </section>
  );
};

export default Contributors;

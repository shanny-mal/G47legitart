import React, { useState } from "react";

const Subscribe: React.FC = () => {
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setOk(true);
      setEmail("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h1 className="text-3xl font-serif">Subscribe to KaribaMagazine</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Receive new issues, exclusive content and event invites.
        </p>

        <form onSubmit={handle} className="mt-6 flex gap-2">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border rounded px-4 py-2 text-black"
            placeholder="you@example.com"
          />
          <button className="px-6 py-2 bg-karibaCoral text-white rounded">
            Subscribe
          </button>
        </form>

        {ok && (
          <p className="mt-4 text-green-500">
            Thanks — check your email for confirmation.
          </p>
        )}
      </div>
    </section>
  );
};

export default Subscribe;

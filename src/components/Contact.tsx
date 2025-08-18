import React, { useState } from "react";

const Contact: React.FC = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSent(true);
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section id="contact" className="py-12">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8">
        <form onSubmit={submit} className="space-y-4">
          <h3 className="text-xl font-serif">Contact & Press</h3>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            className="w-full border rounded px-3 py-2"
          />
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            className="w-full border rounded px-3 py-2"
          />
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Message"
            className="w-full border rounded px-3 py-2 h-36"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-karibaCoral text-white rounded"
          >
            Send
          </button>
          {sent && (
            <p className="text-sm text-green-500">
              Message sent. We will reply shortly.
            </p>
          )}
        </form>

        <div>
          <h4 className="font-semibold mb-2">Our location</h4>
          <p className="text-sm mb-4">Editorial HQ — Kariba</p>
          <iframe
            title="kariba map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d..."
            className="w-full h-80 rounded border"
          />
        </div>
      </div>
    </section>
  );
};

export default Contact;

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function StartCTA() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email || !/.+@.+\..+/.test(email)) return;
    setSent(true);
    try {
      const list = JSON.parse(localStorage.getItem("cogspa.waitlist") || "[]");
      list.push({ email, t: new Date().toISOString() });
      localStorage.setItem("cogspa.waitlist", JSON.stringify(list));
    } catch {}
  };

  return (
    <section id="start" className="relative glow-bg grain">
      <form onSubmit={onSubmit}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="hello@yourstudio.com"
        />
        <button type="submit" className="pill pill-light">
          {sent ? "On the list" : "Start free"}
        </button>
      </form>
    </section>
  );
}

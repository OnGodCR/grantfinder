"use client";

import { useEffect, useState } from "react";

type Grant = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  score: number; // % match score
  deadline: string; // ISO date
  url: string; // link to external site
};

export default function DiscoverPage() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          "https://grantfinder-production.up.railway.app/api/internal/grants",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ q: "" }),
          }
        );
        const data = await res.json();
        setGrants(data.items || []);
      } catch (err) {
        console.error("fetch grants failed", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Discover Grants</h1>

      {loading && <p>Loading...</p>}

      {!loading && grants.length === 0 && (
        <div className="p-4 border rounded-lg text-gray-400">
          No results. Try a different filter or search.
        </div>
      )}

      <div className="grid gap-6">
        {grants.map((g) => {
          const daysLeft = Math.ceil(
            (new Date(g.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          const deadlineColor =
            daysLeft <= 7
              ? "bg-red-500/20 text-red-400"
              : daysLeft <= 30
              ? "bg-yellow-500/20 text-yellow-400"
              : "bg-green-500/20 text-green-400";

          return (
            <a
              key={g.id}
              href={g.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl bg-white/5 p-6 border border-white/10 shadow hover:bg-white/10 transition"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold">{g.title}</h2>
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-500/20 text-blue-400 font-bold text-lg">
                  {g.score}%
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                {g.summary}
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                {g.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs rounded-full bg-white/10 text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex justify-between text-sm text-gray-400">
                <span className={`px-3 py-1 rounded-full ${deadlineColor}`}>
                  {daysLeft > 0
                    ? `${daysLeft} days left`
                    : "Deadline passed"}
                </span>
                <span className="italic">Click to view grant →</span>
              </div>
            </a>
          );
        })}
      </div>
    </main>
  );
}

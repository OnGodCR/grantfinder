"use client";

import { useEffect, useState } from "react";

type Grant = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  score: number;
  deadline: string;
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
      <h1 className="text-3xl font-bold mb-4">Discover Grants</h1>

      {loading && <p>Loading...</p>}

      {!loading && grants.length === 0 && (
        <div className="p-4 border rounded-lg">
          No results. Try a different filter or search.
        </div>
      )}

      <div className="grid gap-4">
        {grants.map((g) => (
          <div
            key={g.id}
            className="rounded-2xl bg-white/5 p-4 border border-white/10 shadow"
          >
            <h2 className="text-xl font-semibold">{g.title}</h2>
            <p className="text-sm text-gray-400">{g.summary}</p>
            <div className="mt-2 text-xs text-gray-500">
              Tags: {g.tags?.join(", ") || "None"} | Score: {g.score} | Deadline:{" "}
              {new Date(g.deadline).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

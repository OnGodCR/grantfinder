// frontend/app/discover/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { fetchGrants } from "@/lib/api"; // make sure you added this helper
import ScoreBadge from "@/components/ScoreBadge";

export default function DiscoverPage() {
  const { user, isLoaded } = useUser();
  const [grants, setGrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    (async () => {
      try {
        const res = await fetchGrants({
          q: "",
          limit: 24,
          clerkId: user?.id,
        });
        setGrants(res.items || []);
      } catch (err) {
        console.error("fetchGrants failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoaded, user]);

  if (!isLoaded || loading) return <div className="p-6">Loading…</div>;

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Discover Grants</h1>

      <div className="space-y-4">
        {grants.map((g) => (
          <article
            key={g.id}
            className="relative rounded-2xl bg-white/5 border border-white/10 p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold">{g.title}</h3>
              <ScoreBadge score={g.matchScore} />
            </div>

            <p className="mt-2 text-white/70 line-clamp-2">{g.summary}</p>

            {g.deadline && (
              <div className="mt-3">
                <span className="inline-block text-sm px-2 py-1 rounded-md bg-green-600/20 text-green-300">
                  {Math.ceil(
                    (new Date(g.deadline).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  days left
                </span>
              </div>
            )}

            <a
              className="mt-3 block text-blue-400 underline text-sm"
              href={g.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              Click to view grant →
            </a>
          </article>
        ))}
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getMyPreferences } from "@/lib/me";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [p, setP] = useState<any>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { setLoading(false); return; }
    (async () => {
      try {
        const data = await getMyPreferences(user.id);
        if (data.exists) setP(data.profile);
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoaded, user]);

  if (!isLoaded || loading) return <div className="p-6">Loading…</div>;
  if (!user) return <div className="p-6">Please sign in.</div>;

  if (!p) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Your Profile</h1>
        <p>No preferences saved yet.</p>
        <a className="text-blue-400 underline" href="/onboarding">Complete onboarding →</a>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Your Profile</h1>

      <section className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-3">
        <h2 className="text-lg font-medium">Basic Info</h2>
        <div>Department: <b>{p.department || "-"}</b></div>
        <div>Position: <b>{p.position || "-"}</b></div>
      </section>

      <section className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-3">
        <h2 className="text-lg font-medium">Research Focus</h2>
        <div>Research areas: <b>{(p.researchAreas || []).join(", ") || "-"}</b></div>
        <div>Keywords: <b>{(p.keywords || []).join(", ") || "-"}</b></div>
        <div>Funding categories: <b>{(p.fundingCategories || []).join(", ") || "-"}</b></div>
      </section>

      <section className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-3">
        <h2 className="text-lg font-medium">Preferences</h2>
        <div>Preferred sources: <b>{(p.preferredSources || []).join(", ") || "-"}</b></div>
        <div>Funding level: <b>{p.fundingLevel || "-"}</b></div>
        <div>Project duration: <b>{p.projectDuration || "-"}</b></div>
        <div>Deadline first: <b>{p.deadlineFirst ? "Yes" : "No"}</b></div>
      </section>

      <section className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-3">
        <h2 className="text-lg font-medium">Notifications</h2>
        <div>Update frequency: <b>{p.alertFrequency || "-"}</b></div>
        <div>Method: <b>{p.notificationMethod || "-"}</b></div>
      </section>
    </main>
  );
}

// frontend/app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getMyPreferences } from "@/lib/me";

type Prefs = {
  clerkId?: string;
  department?: string;
  position?: string;
  researchAreas?: string[];
  keywords?: string[];
  fundingCategories?: string[];
  preferredSources?: string[];
  fundingLevel?: string;
  projectDuration?: string;
  deadlineFirst?: boolean;
  alertFrequency?: string;
  notificationMethod?: string;
  // keep it open for any extra fields the backend returns
  [k: string]: any;
};

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<Prefs | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { setLoading(false); return; }

    (async () => {
      try {
        const resp = await getMyPreferences(user.id);
        if (resp?.exists) {
          // NOTE: use resp.data (not resp.profile)
          setPrefs(resp.data as Prefs);
        } else {
          setPrefs(null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoaded, user]);

  if (!isLoaded || loading) return <div className="p-6">Loading…</div>;
  if (!user) return <div className="p-6">Please sign in.</div>;

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Profile</h1>
        <p className="text-white/60">Your saved preferences</p>
      </header>

      {prefs ? (
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
          <Row label="Department" value={prefs.department} />
          <Row label="Position" value={prefs.position} />
          <Row label="Research Areas" value={(prefs.researchAreas || []).join(", ")} />
          <Row label="Keywords" value={(prefs.keywords || []).join(", ")} />
          <Row label="Funding Categories" value={(prefs.fundingCategories || []).join(", ")} />
          <Row label="Preferred Sources" value={(prefs.preferredSources || []).join(", ")} />
          <Row label="Funding Level" value={prefs.fundingLevel} />
          <Row label="Project Duration" value={prefs.projectDuration} />
          <Row label="Deadline First" value={prefs.deadlineFirst ? "Yes" : "No"} />
          <Row label="Alert Frequency" value={prefs.alertFrequency} />
          <Row label="Notification Method" value={prefs.notificationMethod} />
        </div>
      ) : (
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <p className="text-white/80">
            No preferences found yet. Head to <a className="underline" href="/onboarding">Onboarding</a> to set them up.
          </p>
        </div>
      )}
    </main>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-48 text-white/60">{label}</div>
      <div className="flex-1">{value || <span className="text-white/40">—</span>}</div>
    </div>
  );
}

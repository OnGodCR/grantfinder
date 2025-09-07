"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getMyPreferences, saveMyPreferences, PreferencesPayload } from "@/lib/me";

const DEPARTMENTS = ["Engineering", "Medicine", "Arts & Sciences", "Education", "Business", "Other"];
const POSITIONS = ["Faculty", "Postdoc", "Research Staff", "Graduate Student", "Admin", "Other"];
const FUNDING_CATEGORIES = ["Research", "Equipment/Infrastructure", "Training/Education", "Travel/Collaboration"];
const SOURCES = ["NSF", "NIH", "Horizon Europe", "Foundations", "Other"];
const LEVELS = ["< $50K", "$50K–$250K", "$250K–$1M", "> $1M"];
const DURATIONS = ["Short (<1 year)", "Medium (1–3 years)", "Long (>3 years)"];
const ALERTS = ["Real-time", "Daily digest", "Weekly digest"];
const METHODS = ["Email", "In-app only", "Both"];

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<PreferencesPayload>({
    clerkId: "",
    department: "",
    position: "",
    researchAreas: [],
    keywords: [],
    fundingCategories: [],
    preferredSources: [],
    fundingLevel: "",
    projectDuration: "",
    deadlineFirst: true,
    alertFrequency: "Weekly digest",
    notificationMethod: "Email",
  });

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setLoading(false);
      return;
    }
    const clerkId = user.id;
    setForm((f) => ({ ...f, clerkId }));
    (async () => {
      try {
        const data = await getMyPreferences(clerkId);

        const hasPrefs =
          !!data &&
          (("exists" in (data as any) && (data as any).exists === true) ||
            Object.keys(data as Record<string, any>).length > 0);

        if (hasPrefs) {
          window.location.replace("/discover");
          return;
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoaded, user]);

  function toggleArr(key: keyof PreferencesPayload, val: string) {
    setForm((f) => {
      const cur = new Set([...(f[key] as string[] || [])]);
      cur.has(val) ? cur.delete(val) : cur.add(val);
      return { ...f, [key]: Array.from(cur) };
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clerkId) return alert("Please sign in first.");
    setSaving(true);
    try {
      await saveMyPreferences(form);
      window.location.replace("/discover");
    } catch (e) {
      console.error(e);
      alert("Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!isLoaded || loading) return <div className="p-6">Loading…</div>;
  if (!user) return <div className="p-6">Please sign in.</div>;

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">Tell us about your work</h1>
        <p className="text-white/60 mt-1">
          We’ll personalize grants based on your answers. Takes ~60 seconds.
        </p>
      </header>

      <form className="space-y-8" onSubmit={onSubmit}>
        {/* Section 1 */}
        <section className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
          <h2 className="text-xl font-medium">Basic Researcher Info</h2>

          <label className="block">
            <span className="text-sm text-white/70">Department / School</span>
            <select
              className="mt-1 w-full rounded-md bg-white/5 border border-white/10 p-2"
              value={form.department || ""}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            >
              <option value="">Select…</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-white/70">Position / Role</span>
            <select
              className="mt-1 w-full rounded-md bg-white/5 border border-white/10 p-2"
              value={form.position || ""}
              onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
            >
              <option value="">Select…</option>
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </section>

        {/* Section 2 */}
        <section className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
          <h2 className="text-xl font-medium">Research Focus</h2>

          <label className="block">
            <span className="text-sm text-white/70">Primary research areas (comma separated)</span>
            <input
              className="mt-1 w-full rounded-md bg-white/5 border border-white/10 p-2"
              placeholder='e.g., "AI in Healthcare, Climate Modeling"'
              value={(form.researchAreas || []).join(", ")}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  researchAreas: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                }))
              }
            />
          </label>

          <div>
            <span className="text-sm text-white/70">Select relevant keywords</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {["STEM", "Education", "Policy", "Health", "AI", "Climate"].map((k) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => toggleArr("keywords", k)}
                  className={`px-3 py-1 rounded-full text-sm border transition ${
                    (form.keywords || []).includes(k)
                      ? "bg-blue-500/20 text-blue-300 border-blue-400/40"
                      : "bg-white/5 text-white/80 border-white/10"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-sm text-white/70">Funding categories</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {FUNDING_CATEGORIES.map((k) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => toggleArr("fundingCategories", k)}
                  className={`px-3 py-1 rounded-full text-sm border transition ${
                    (form.fundingCategories || []).includes(k)
                      ? "bg-blue-500/20 text-blue-300 border-blue-400/40"
                      : "bg-white/5 text-white/80 border-white/10"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
          <h2 className="text-xl font-medium">Preferences & Constraints</h2>

          <div>
            <span className="text-sm text-white/70">Preferred funding sources</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {SOURCES.map((k) => (
                <label
                  key={k}
                  className="flex items-center gap-2 rounded-md px-3 py-1 bg-white/5 border border-white/10"
                >
                  <input
                    type="checkbox"
                    checked={(form.preferredSources || []).includes(k)}
                    onChange={() => toggleArr("preferredSources", k)}
                  />
                  <span>{k}</span>
                </label>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-sm text-white/70">Funding level of interest</span>
            <select
              className="mt-1 w-full rounded-md bg-white/5 border border-white/10 p-2"
              value={form.fundingLevel || ""}
              onChange={(e) => setForm((f) => ({ ...f, fundingLevel: e.target.value }))}
            >
              <option value="">Select…</option>
              {LEVELS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-white/70">Typical project duration</span>
            <select
              className="mt-1 w-full rounded-md bg-white/5 border border-white/10 p-2"
              value={form.projectDuration || ""}
              onChange={(e) => setForm((f) => ({ ...f, projectDuration: e.target.value }))}
            >
              <option value="">Select…</option>
              {DURATIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={!!form.deadlineFirst}
              onChange={(e) => setForm((f) => ({ ...f, deadlineFirst: e.target.checked }))}
            />
            <span className="text-sm text-white/80">See near-term deadlines first</span>
          </label>
        </section>

        {/* Section 4 */}
        <section className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
          <h2 className="text-xl font-medium">Alerts & Notifications</h2>

          <label className="block">
            <span className="text-sm text-white/70">How often do you want updates?</span>
            <select
              className="mt-1 w-full rounded-md bg-white/5 border border-white/10 p-2"
              value={form.alertFrequency || ""}
              onChange={(e) => setForm((f) => ({ ...f, alertFrequency: e.target.value }))}
            >
              <option value="">Select…</option>
              {ALERTS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-white/70">Preferred notification method</span>
            <select
              className="mt-1 w-full rounded-md bg-white/5 border border-white/10 p-2"
              value={form.notificationMethod || ""}
              onChange={(e) => setForm((f) => ({ ...f, notificationMethod: e.target.value }))}
            >
              <option value="">Select…</option>
              {METHODS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
        >
          {saving ? "Saving…" : "Save & Continue"}
        </button>
      </form>
    </main>
  );
}

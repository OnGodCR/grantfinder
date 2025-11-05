"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  getMyPreferences,
  saveMyPreferences,
  PreferencesPayload,
} from "@/lib/me";
import { UserProfile, getDefaultUserProfile } from "@/lib/matchScore";
import { GraduationCap, DollarSign, Building, MapPin, Clock, Target, Award, Bell } from "lucide-react";

const DEPARTMENTS = ["Engineering", "Medicine", "Arts & Sciences", "Education", "Business", "Other"];
const POSITIONS = ["Faculty", "Postdoc", "Research Staff", "Graduate Student", "Admin", "Other"];
const FUNDING_CATEGORIES = ["Research", "Equipment/Infrastructure", "Training/Education", "Travel/Collaboration"];
const SOURCES = ["NSF", "NIH", "Horizon Europe", "Foundations", "Other"];
const LEVELS = ["< $50K", "$50K–$250K", "$250K–$1M", "> $1M"];
const DURATIONS = ["Short (<1 year)", "Medium (1–3 years)", "Long (>3 years)"];
const ALERTS = ["Real-time", "Daily digest", "Weekly digest"];
const METHODS = ["Email", "In-app only", "Both"];

// Enhanced options for research profile
const RESEARCH_AREAS = [
  "Artificial Intelligence", "Machine Learning", "Data Science", "Computer Science",
  "Biology", "Chemistry", "Physics", "Mathematics", "Statistics",
  "Medicine", "Public Health", "Psychology", "Neuroscience",
  "Environmental Science", "Climate Science", "Sustainability",
  "Engineering", "Materials Science", "Robotics", "Biotechnology",
  "Social Sciences", "Economics", "Political Science", "Sociology",
  "Arts", "Humanities", "Education", "Policy", "Other"
];

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner (0-2 years)", description: "New to research or early career" },
  { value: "intermediate", label: "Intermediate (2-5 years)", description: "Some research experience" },
  { value: "advanced", label: "Advanced (5-10 years)", description: "Experienced researcher" },
  { value: "expert", label: "Expert (10+ years)", description: "Senior researcher or PI" }
];

const GRANT_TYPES = [
  "Research Grant", "Fellowship", "Scholarship", "Training Grant", 
  "Equipment Grant", "Travel Grant", "Conference Grant", "Seed Funding"
];

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

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

  const [researchProfile, setResearchProfile] = useState<UserProfile>(getDefaultUserProfile());

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
        const resp = await getMyPreferences(clerkId);
        // safe check for existence flag
        if (resp?.exists) {
          // already onboarded – go to discover
          window.location.replace("/discover");
          return;
        }
      } catch {
        // ignore and show the form
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoaded, user]);

  function toggleArr(key: keyof PreferencesPayload, val: string) {
    setForm((f) => {
      const cur = new Set([...(Array.isArray(f[key]) ? (f[key] as string[]) : [])]);
      cur.has(val) ? cur.delete(val) : cur.add(val);
      return { ...f, [key]: Array.from(cur) as any };
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clerkId) {
      alert("Please sign in first.");
      return;
    }
    setSaving(true);
    try {
      // Save both preferences and research profile
      await saveMyPreferences(form);
      
      // Save research profile to localStorage for match scoring
      localStorage.setItem('userResearchProfile', JSON.stringify(researchProfile));
      
      window.location.replace("/discover");
    } catch (e) {
      console.error(e);
      alert("Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function updateResearchProfile(updates: Partial<UserProfile>) {
    setResearchProfile(prev => ({ ...prev, ...updates }));
  }

  function nextStep() {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  if (!isLoaded || loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
        <p className="text-slate-300 text-lg">Loading...</p>
      </div>
    </div>
  );
  
  if (!user) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-slate-400 text-6xl mb-4">🔐</div>
        <h1 className="text-2xl font-bold text-white mb-2">Please Sign In</h1>
        <p className="text-slate-300">You need to be signed in to complete onboarding.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to Grantlytic!</h1>
          <p className="text-slate-300 text-lg mb-8">Let's set up your research profile to find the perfect grants for you.</p>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-700/50 rounded-full h-2 mb-8">
            <div 
              className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
          
          <div className="flex justify-center space-x-4">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i + 1 <= currentStep
                    ? 'bg-teal-500 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={onSubmit}>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="w-8 h-8 text-teal-400" />
                <h2 className="text-2xl font-bold text-white">Basic Information</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-3">
                    Department / School
                  </label>
                  <select
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                    value={form.department || ""}
                    onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  >
                    <option value="">Select your department...</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-3">
                    Position / Role
                  </label>
                  <select
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                    value={form.position || ""}
                    onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                  >
                    <option value="">Select your position...</option>
                    {POSITIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-3">
                    Research Experience Level
                  </label>
                  <div className="space-y-3">
                    {EXPERIENCE_LEVELS.map((level) => (
                      <label key={level.value} className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-xl cursor-pointer hover:bg-slate-700/50 transition-colors">
                        <input
                          type="radio"
                          name="experienceLevel"
                          value={level.value}
                          checked={researchProfile.experienceLevel === level.value}
                          onChange={(e) => updateResearchProfile({ experienceLevel: e.target.value as any })}
                          className="mt-1"
                        />
                        <div>
                          <div className="text-white font-medium">{level.label}</div>
                          <div className="text-slate-400 text-sm">{level.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Research Interests */}
          {currentStep === 2 && (
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-8 h-8 text-teal-400" />
                <h2 className="text-2xl font-bold text-white">Research Interests</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-3">
                    Primary Research Areas
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {RESEARCH_AREAS.map((area) => (
                      <button
                        type="button"
                        key={area}
                        onClick={() => {
                          const current = researchProfile.researchInterests;
                          const updated = current.includes(area)
                            ? current.filter(a => a !== area)
                            : [...current, area];
                          updateResearchProfile({ researchInterests: updated });
                        }}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          researchProfile.researchInterests.includes(area)
                            ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                            : "bg-slate-700/30 text-slate-300 border border-slate-600/30 hover:bg-slate-700/50"
                        }`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-3">
                    Custom Research Areas
                  </label>
                  <input
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                    placeholder="Enter additional research areas (comma separated)"
                    value={(form.researchAreas || []).join(", ")}
                    onChange={(e) => {
                      const areas = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                      setForm((f) => ({ ...f, researchAreas: areas }));
                      updateResearchProfile({ researchInterests: [...researchProfile.researchInterests, ...areas] });
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Funding Preferences */}
          {currentStep === 3 && (
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="w-8 h-8 text-teal-400" />
                <h2 className="text-2xl font-bold text-white">Funding Preferences</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-3">
                    Funding Range (USD)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-xs mb-1">Minimum</label>
                      <input
                        type="number"
                        value={researchProfile.fundingRange.min}
                        onChange={(e) => updateResearchProfile({
                          fundingRange: {
                            ...researchProfile.fundingRange,
                            min: parseInt(e.target.value) || 0
                          }
                        })}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                        placeholder="50000"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs mb-1">Maximum</label>
                      <input
                        type="number"
                        value={researchProfile.fundingRange.max}
                        onChange={(e) => updateResearchProfile({
                          fundingRange: {
                            ...researchProfile.fundingRange,
                            max: parseInt(e.target.value) || 1000000
                          }
                        })}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                        placeholder="500000"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-3">
                    Preferred Funding Sources
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {SOURCES.map((source) => (
                      <label key={source} className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-xl cursor-pointer hover:bg-slate-700/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={researchProfile.preferredAgencies.includes(source)}
                          onChange={(e) => {
                            const current = researchProfile.preferredAgencies;
                            const updated = e.target.checked
                              ? [...current, source]
                              : current.filter(s => s !== source);
                            updateResearchProfile({ preferredAgencies: updated });
                          }}
                        />
                        <span className="text-slate-300">{source}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-3">
                    Preferred Grant Types
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {GRANT_TYPES.map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => {
                          const current = researchProfile.preferredGrantTypes;
                          const updated = current.includes(type)
                            ? current.filter(t => t !== type)
                            : [...current, type];
                          updateResearchProfile({ preferredGrantTypes: updated });
                        }}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          researchProfile.preferredGrantTypes.includes(type)
                            ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                            : "bg-slate-700/30 text-slate-300 border border-slate-600/30 hover:bg-slate-700/50"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Notifications & Final Setup */}
          {currentStep === 4 && (
            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-8 h-8 text-teal-400" />
                <h2 className="text-2xl font-bold text-white">Notifications & Preferences</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-3">
                    How often do you want updates?
                  </label>
                  <select
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                    value={form.alertFrequency || ""}
                    onChange={(e) => setForm((f) => ({ ...f, alertFrequency: e.target.value }))}
                  >
                    <option value="">Select frequency...</option>
                    {ALERTS.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-3">
                    Preferred notification method
                  </label>
                  <select
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                    value={form.notificationMethod || ""}
                    onChange={(e) => setForm((f) => ({ ...f, notificationMethod: e.target.value }))}
                  >
                    <option value="">Select method...</option>
                    {METHODS.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-3">
                    Deadline Buffer (days)
                  </label>
                  <input
                    type="number"
                    value={researchProfile.deadlineBuffer}
                    onChange={(e) => updateResearchProfile({ deadlineBuffer: parseInt(e.target.value) || 30 })}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                    placeholder="30"
                  />
                  <p className="text-slate-400 text-sm mt-1">How many days before deadline should we remind you?</p>
                </div>

                <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-2">Profile Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Research Areas:</span>
                      <span className="text-white ml-2">{researchProfile.researchInterests.length} selected</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Funding Range:</span>
                      <span className="text-white ml-2">${researchProfile.fundingRange.min.toLocaleString()} - ${researchProfile.fundingRange.max.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Experience Level:</span>
                      <span className="text-white ml-2 capitalize">{researchProfile.experienceLevel}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Preferred Agencies:</span>
                      <span className="text-white ml-2">{researchProfile.preferredAgencies.length} selected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                currentStep === 1
                  ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {saving ? "Saving..." : "Complete Setup"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

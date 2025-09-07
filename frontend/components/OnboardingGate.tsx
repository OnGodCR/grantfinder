"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getMyPreferences } from "@/lib/me";

export default function OnboardingGate() {
  const { user, isLoaded } = useUser();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { setChecked(true); return; }
    (async () => {
      try {
        const data = await getMyPreferences(user.id);
        const path = typeof window !== "undefined" ? window.location.pathname : "/";
        if (!data.exists && path !== "/onboarding") {
          window.location.replace("/onboarding");
          return;
        }
      } catch {}
      setChecked(true);
    })();
  }, [isLoaded, user]);

  if (!checked) return null;
  return null;
}

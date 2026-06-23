"use client";

import { useEffect } from "react";
import { useUserStore } from "@/stores/useUserStore";
import type { UserProfile } from "@/types/database";

export function UserProfileSync({ profile }: { profile: UserProfile }) {
  const setProfile = useUserStore((s) => s.setProfile);
  useEffect(() => { setProfile(profile); }, [profile, setProfile]);
  return null;
}

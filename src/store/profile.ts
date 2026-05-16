"use client";
import { useSyncExternalStore } from "react";
import {
  deriveProfile,
  getProgress,
  setUsername as writeUsername,
  subscribe,
  type ProgressState,
} from "@/lib/local-progress";

const EMPTY_SNAPSHOT: ProgressState = {
  username: "player",
  xp: 0,
  streakDays: 1,
  lastActiveAt: new Date(0).toISOString(),
  lessonProgress: [],
  quizAttempts: [],
  gameScores: [],
  achievements: [],
};

export function useProgress(): ProgressState {
  return useSyncExternalStore(
    subscribe,
    () => getProgress(),
    () => EMPTY_SNAPSHOT
  );
}

export function useProfile() {
  const s = useProgress();
  return deriveProfile(s);
}

export function setName(name: string) {
  writeUsername(name);
}

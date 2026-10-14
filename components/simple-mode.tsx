"use client";
import { useEffect } from "react";
import { KEYS, load } from "@/lib/store";

export function applySimpleMode(on: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("simple-mode", on);
}

// Mounted once in the root layout: re-applies the persisted preference on
// every page load. Toggles in Settings call applySimpleMode directly.
export function SimpleModeMount() {
  useEffect(() => {
    applySimpleMode(load<boolean>(KEYS.uiSimple, false));
  }, []);
  return null;
}

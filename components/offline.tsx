"use client";
import { useEffect, useState } from "react";

// Shows a persistent banner when the device is offline — disaster apps die
// when networks do, so Nivarana makes its offline state explicit.
export function OfflineBanner() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    setOnline(navigator.onLine);
    const goOff = () => setOnline(false);
    const goOn = () => setOnline(true);
    window.addEventListener("offline", goOff);
    window.addEventListener("online", goOn);
    return () => {
      window.removeEventListener("offline", goOff);
      window.removeEventListener("online", goOn);
    };
  }, []);
  if (online) return null;
  return (
    <div
      role="status"
      className="border-b border-gold/40 bg-gold/15 px-4 py-2 text-center text-sm font-semibold text-ink"
    >
      📵 You&apos;re offline. Everything below still works — reports, plans, contacts and
      guides are saved on this device.
    </div>
  );
}

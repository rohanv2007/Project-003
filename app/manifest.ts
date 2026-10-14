import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nivarana — Flood & Disaster Resilience",
    short_name: "Nivarana",
    description:
      "Prepare, report, and respond to floods and disasters. Works offline, bilingual, local-first.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f4f1e8",
    theme_color: "#0f6f6a",
    lang: "en",
    icons: [
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}

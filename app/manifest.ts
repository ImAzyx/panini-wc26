import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Panini WC26",
    short_name: "Panini",
    description: "Suivez votre collection Panini FIFA WC 2026",
    start_url: "/collection",
    display: "standalone",
    background_color: "#0D1F0D",
    theme_color: "#0D1F0D",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

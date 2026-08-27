import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Osmium BPO | Call. Delegate. Outsource. Automate.",
    short_name: "Osmium BPO",

    description:
      "Osmium BPO helps businesses operate smarter through professional call centre services, virtual assistance, outsourcing, remote workforce solutions and business process support.",

    start_url: "/",
    display: "standalone",

    background_color: "#071a2f",
    theme_color: "#071a2f",

    orientation: "portrait-primary",

    icons: [
      {
        src: "/icons/icon-192.jpg",
        sizes: "192x192",
        type: "image/jpeg",
      },
      {
        src: "/icons/icon-512.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
      {
        src: "/icons/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
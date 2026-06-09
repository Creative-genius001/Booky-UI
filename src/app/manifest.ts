import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bookly — Barbershop booking",
    short_name: "Bookly",
    description:
      "Book your next barbershop appointment in seconds — pick a service, choose a time and pay securely.",
    start_url: "/",
    display: "standalone",
    background_color: "#F2ECEC",
    theme_color: "#E05A29",
    orientation: "portrait",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

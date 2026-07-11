import { Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";

export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["500", "600"],
});

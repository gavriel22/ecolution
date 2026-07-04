import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";

export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["500", "600"],
});

// In src/app/layout.tsx:
//   <body className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} font-body`}>

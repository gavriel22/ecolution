import type { Metadata } from "next";
import { fraunces, inter, plexMono } from "@/lib/fonts";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";
import { Navbar } from "@/features/landing/components/Navbar";

export const metadata: Metadata = {
  title: "Ecolution",
  description: "Platform pelacakan dan verifikasi aktivitas lingkungan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-body bg-paper-50 text-ink-900" suppressHydrationWarning>
        <AppProviders>
          <Navbar />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}

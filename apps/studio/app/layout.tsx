import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Centum Studio",
  description: "Plan, approve and publish across every Instagram page and YouTube channel in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas text-ink antialiased">{children}</body>
    </html>
  );
}

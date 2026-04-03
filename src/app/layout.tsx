import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Indian Handicrafts Portal",
  description: "Frontend prototype for an interactive Indian handicrafts portal",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

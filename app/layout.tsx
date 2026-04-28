import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "KPS Konstruksi",
  description: "Website perusahaan konstruksi KPS Konstruksi"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1593cb"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

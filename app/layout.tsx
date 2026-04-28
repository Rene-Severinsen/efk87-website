import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EFK87",
  description: "EFK87 website",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="da">
      <body>{children}</body>
      </html>
  );
}
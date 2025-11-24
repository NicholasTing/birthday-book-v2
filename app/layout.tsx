import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Memory Album",
  description:
    "Create albums for birthdays, get well, celebrations, and more—each filled with shared memories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

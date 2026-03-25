import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Property Auction Admin | India Property Auction Discovery",
  description:
    "Admin panel for managing India Property Auction Discovery platform - properties, sources, ingestion, and users.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

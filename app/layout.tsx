import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ActivityTracker } from "@/components/ActivityTracker";

export const metadata: Metadata = {
  title: "Archivo Digital",
  description: "Sistema de gestión de archivos digitales",
  // keywords: ["archivo", "documentos", "gestión digital"],
  // authors: [{ name: "Tu Organización" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-theme="cerberus" lang="es" suppressHydrationWarning>
      <body
        className={`antialiased`}
      >
        <ActivityTracker />
        {children}
      </body>
    </html>
  );
}

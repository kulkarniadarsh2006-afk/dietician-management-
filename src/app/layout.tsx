import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | NutriCare Clinical Platform",
    default: "NutriCare | Clinical Dietitian Management System",
  },
  description:
    "Production-minded clinical platform for registered dietitians and nutritionists. Handling patient health information with strict HIPAA-aligned privacy.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#137a5f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex h-full flex-col font-sans">{children}</body>
    </html>
  );
}

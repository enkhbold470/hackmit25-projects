import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "./context/AppContext";

export const metadata: Metadata = {
  title: "SkiPit",
  description: "Gamify reducing unnecessary Doordash or unhealthy food orders",
  manifest: "/site.webmanifest",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#4CAF50",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <AppProvider>
          {children}
        </AppProvider>

      </body>
    </html>
  );
}

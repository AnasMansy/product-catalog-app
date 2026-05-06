import type { Metadata } from "next";

import Navbar from "@/components/Navbar";
import { getThemeInitializationScript } from "@/lib/theme";
import StoreProvider from "@/store/provider";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Catalog Pilot",
    template: "%s | Catalog Pilot",
  },
  applicationName: "Catalog Pilot",
  description:
    "A frontend-only product management starter built with Next.js, Redux Toolkit, TypeScript, Tailwind CSS, and DummyJSON.",
  authors: [{ name: "Anas" }],
  creator: "Anas",
  publisher: "Anas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="theme-light" suppressHydrationWarning>
      <body className="min-h-screen text-foreground antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: getThemeInitializationScript(),
          }}
        />
        <StoreProvider>
          <div className="min-h-screen">
            <Navbar />
            <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CompIntel - Compensation Intelligence System",
  description: "Browse, compare, and analyze technology salary and compensation data based on levels and roles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full bg-gray-950 text-gray-100">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1 bg-gray-950">
          {children}
        </main>
        <footer className="border-t border-gray-800 bg-gray-950 py-6 text-center text-xs text-gray-500">
          <div className="container mx-auto px-4">
            &copy; {new Date().getFullYear()} CompIntel. All rights reserved. Levels matter more than job titles.
          </div>
        </footer>
      </body>
    </html>
  );
}

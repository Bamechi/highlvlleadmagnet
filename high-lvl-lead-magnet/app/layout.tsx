import type { Metadata } from "next";
import { Archivo_Black, Inter } from "next/font/google";
import "./globals.css";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo-black",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "High Lvl Lead Magnet",
  description: "Get a curated list of AI tools or business leads, built and emailed to you.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${archivoBlack.variable} ${inter.variable} font-body bg-construct-base text-construct-ink`}>
        {children}
      </body>
    </html>
  );
}

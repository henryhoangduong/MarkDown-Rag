import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import Navbar from "@/components/navbar";
import RootProvider from "@/components/providers/root-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BDA",
  description: "Smart assistant",
};
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RootProvider>
          <Navbar />
          <main className="flex h-[calc(85dvh)] flex-col items-center justify-center md:px-24 gap-4">
            <div className="w-full max-h-screen h-[90%]  text-sm flex">
              {children}
              <Toaster />
            </div>
          </main>
        </RootProvider>
      </body>
    </html>
  );
}

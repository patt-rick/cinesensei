import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Navigation } from "@/components/layout/Navigation";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CineSensei — Your AI Movie & Anime Guide",
  description:
    "Discover personalized movie and anime recommendations powered by AI. Find your next favorite with CineSensei.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-[#0a0a0a] text-white flex flex-col">
        <AuthProvider>
          <ErrorBoundary>
            <Navigation />
            <main className="flex-1 md:ml-56 pb-20 md:pb-0">
              {children}
            </main>
            <Toaster position="top-right" theme="dark" />
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}

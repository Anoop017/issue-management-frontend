import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import QueryProvider from "@/providers/QueryProvider";
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Issue Management Platform",
  description: "Manage and track project issues efficiently",
  icons: {
    icon: '/IM-icon.png',
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex">
        <QueryProvider>
          <Sidebar />
          <main className="flex-1 min-h-screen bg-background overflow-auto">
            {children}
          </main>
          <Toaster position="top-center" reverseOrder={false} />
        </QueryProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Madiff Outbound & Intelligence Hub",
  description: "Executive Multi-Channel Outbound & Growth Operations System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${plusJakarta.className} antialiased bg-[#f4f6fa] text-[#1f2d3d]`}
      >
        <div className="flex h-screen overflow-hidden bg-[#f4f6fa]">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-y-auto px-7 py-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
import "./globals.css";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WelcomeSplash } from "@/components/WelcomeSplash";

export const metadata: Metadata = {
  title: "UPZISNU Pandanwangi 01",
  description: "Website resmi UPZISNU Pandanwangi 01",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <WelcomeSplash />
        <SiteHeader />
        <main className="min-h-[70vh]">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

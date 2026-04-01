import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "ワンコインマップ | 500円〜1000円のコスパ最強グルメを探そう",
  description: "ワンコインマップは、500円から1000円程度のコスパの良い飲食店、カフェ、ランチ、テイクアウトのお店を地図から簡単に探せるサービスです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground pb-16 sm:pb-0">
        <Navbar />
        <main className="flex-1 w-full flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

import Link from "next/link";
import { Map, Coffee, User } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto sm:hidden">
        <Link href="/" className="flex flex-col items-center justify-center w-full text-muted-foreground hover:text-primary">
          <Map className="w-6 h-6 mb-1" />
          <span className="text-[10px]">マップ</span>
        </Link>
        <Link href="/mypage" className="flex flex-col items-center justify-center w-full text-muted-foreground hover:text-primary">
          <Coffee className="w-6 h-6 mb-1" />
          <span className="text-[10px]">お気に入り</span>
        </Link>
        <Link href="/mypage" className="flex flex-col items-center justify-center w-full text-muted-foreground hover:text-primary">
          <User className="w-6 h-6 mb-1" />
          <span className="text-[10px]">マイページ</span>
        </Link>
      </div>

      {/* Desktop footer version */}
      <div className="hidden sm:block">
        <div className="container mx-auto max-w-5xl py-6 flex flex-col md:flex-row justify-between items-center px-4">
          <p className="text-sm text-muted-foreground leading-loose text-center md:text-left">
            Built by ワンコインマップ. The source code is available on GitHub.
          </p>
          <div className="mt-4 md:mt-0 flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">利用規約</Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">プライバシー</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

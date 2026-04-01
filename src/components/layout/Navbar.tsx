import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User, Plus } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center mx-auto px-4 max-w-5xl">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black rounded-full w-7 h-7 flex items-center justify-center text-xs shadow-md ring-2 ring-orange-200/50 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
              ¥
            </div>
            <span className="font-extrabold text-xl tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600">ワンコイン</span>
              <span className="text-foreground">マップ</span>
            </span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* 검색창을 헤더에 넣을 수 있지만 홈에서 크게 보여주므로 일단 비워둠 */}
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/add">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Plus className="mr-2 h-4 w-4" />
                登録
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="w-9 px-0">
                <User className="h-5 w-5" />
                <span className="sr-only">ログイン</span>
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

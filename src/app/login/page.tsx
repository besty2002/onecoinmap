"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center font-sans">
      {/* Back Button */}
      <div className="w-full p-4">
        <Link href="/">
          <ArrowLeft className="h-6 w-6 text-gray-400" />
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm px-6 pb-20">
        {/* Logo Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent italic mb-3">
             OneCoinMap
          </h1>
          <p className="text-gray-400 font-medium text-sm">도쿄의 500엔 행복을 기록하세요</p>
        </div>

        {/* Login Buttons */}
        <div className="w-full space-y-3">
          <Button 
            onClick={handleGoogleLogin}
            className="w-full h-12 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 flex items-center justify-center gap-3 transition-all shadow-sm active:scale-95"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google로 계속하기
          </Button>
          
          <div className="py-4 flex items-center gap-4 w-full">
            <div className="h-[1px] flex-1 bg-gray-100"></div>
            <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">or</span>
            <div className="h-[1px] flex-1 bg-gray-100"></div>
          </div>

          <p className="text-[11px] text-center text-gray-400 leading-relaxed px-4">
            로그인하면 원코인맵의 <span className="underline">이용약관</span> 및 <span className="underline">개인정보처리방침</span>에 동의하게 됩니다.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-8 border-t w-full text-center">
        <p className="text-xs text-gray-400 font-medium tracking-tight">
          © 2026 OneCoinMap. All rights reserved.
        </p>
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 🚀 인증 성공 후 리다이렉트 (로그인 전 페이지로 되돌아가게 할 수도 있음)
  return NextResponse.redirect(new URL("/", request.url));
}

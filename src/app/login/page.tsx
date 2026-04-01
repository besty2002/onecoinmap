"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert("ログイン失敗: " + error.message);
      } else {
        router.push("/mypage");
        router.refresh();
      }
    } catch (err: any) {
      alert("エラーが発生しました: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-muted/20 min-h-screen pt-20">
      <Card className="w-full max-w-sm shadow-lg border-primary/10">
        <CardHeader className="space-y-1 items-center pb-6">
          <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            ワンコインマップへようこそ
          </CardTitle>
          <CardDescription className="text-center">
            アカウントにログインして、コスパ最強のお店を保存・共有しましょう。
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">パスワード</Label>
                <Link href="#" className="text-xs text-primary hover:underline">
                  パスワードをお忘れですか？
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 mt-2">
            <Button className="w-full font-bold" type="submit" disabled={loading}>
              {loading ? "ログイン中..." : "ログイン"}
            </Button>
            <div className="text-sm text-center text-muted-foreground w-full">
              アカウントをお持ちでないですか？{" "}
              <Link href="/register" className="text-primary hover:underline font-medium">
                新規登録
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

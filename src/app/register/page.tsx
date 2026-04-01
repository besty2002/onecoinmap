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

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (error) {
        alert(error.message);
      } else {
        alert("確認メールを送信しました！メールボックスをご確認ください。");
        router.push("/login");
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
            新規登録
          </CardTitle>
          <CardDescription className="text-center">
            ワンコインマップに参加して、お気に入りのお店を共有しましょう。
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
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
              <Label htmlFor="password">パスワード (6文字以上)</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 mt-2">
            <Button className="w-full font-bold" type="submit" disabled={loading}>
              {loading ? "登録中..." : "アカウントを作成する"}
            </Button>
            <div className="text-sm text-center text-muted-foreground w-full">
              すでにアカウントをお持ちですか？{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                ログイン
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

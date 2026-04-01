"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-background">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-destructive">エラーが発生しました</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          データの読み込み中や処理中に予期せぬエラーが発生しました。時間を置いて再度お試しください。
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <Button onClick={() => reset()} variant="default">
            再試行する
          </Button>
          <Button onClick={() => window.location.href = "/"} variant="outline">
            ホームに戻る
          </Button>
        </div>
      </div>
    </div>
  );
}

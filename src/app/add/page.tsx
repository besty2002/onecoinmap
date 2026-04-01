"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Upload, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AddPlace() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [latLng, setLatLng] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    // 세션 체크
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("ログインが必要です。");
        router.push("/login?next=/add");
      }
    };
    checkUser();
  }, [router, supabase.auth]);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setLatLng({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setAddress("現在地（緯度経度から取得済み）");
        },
        () => alert("位置情報の取得に失敗しました。")
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("ログインが必要です。");
        setLoading(false);
        return;
      }

      // 1. places 테이블에 Insert
      const { data, error } = await supabase.from('places').insert({
        name,
        price_label: `${price}円以下`,
        price_value: parseInt(price, 10),
        category,
        address,
        description,
        latitude: latLng?.lat || 35.6580, // Default to Shibuya if no location
        longitude: latLng?.lng || 139.7016, 
        author_id: user.id
      }).select();

      if (error) {
        alert("エラー: " + error.message);
        return;
      }

      // Optional: 이미지가 있다면 place_images 에 넣는 로직이 들어갈 자리. 현재는 생략.

      alert("登録しました！");
      router.push("/");
      router.refresh();
      
    } catch (err: any) {
      console.error(err);
      alert("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background md:max-w-xl md:mx-auto w-full md:border-x md:shadow-sm">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b px-4 h-14 flex items-center">
        <Button variant="ghost" size="icon" className="-ml-2" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <span className="font-semibold text-lg ml-2">お店を登録</span>
      </div>

      <div className="p-5 flex-1">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>写真</Label>
            <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl h-40 flex flex-col items-center justify-center bg-muted/30 cursor-pointer hover:bg-muted/50 transition relative">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm font-medium text-muted-foreground">現在画像アップロードは準備中です</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">店名</Label>
              <Input id="name" placeholder="例: 松屋 渋谷店" required value={name} onChange={(e)=>setName(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">価格帯</Label>
                <Select required value={price} onValueChange={(v) => v && setPrice(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="選択..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500">500円以下</SelectItem>
                    <SelectItem value="800">800円以下</SelectItem>
                    <SelectItem value="1000">1000円以下</SelectItem>
                    <SelectItem value="1500">1500円以下</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">カテゴリー</Label>
                <Select required value={category} onValueChange={(v) => v && setCategory(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="選択..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ランチ">ランチ</SelectItem>
                    <SelectItem value="カフェ">カフェ</SelectItem>
                    <SelectItem value="居酒屋">居酒屋</SelectItem>
                    <SelectItem value="テイクアウト">テイクアウト</SelectItem>
                    <SelectItem value="ラーメン">ラーメン</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">住所・場所</Label>
              <div className="flex gap-2">
                <Input id="address" placeholder="住所を手入力するか、現在地から取得" required value={address} onChange={(e)=>setAddress(e.target.value)} />
                <Button type="button" variant="secondary" size="icon" className="shrink-0" onClick={handleGetLocation}>
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">おすすめコメント</Label>
              <textarea 
                id="description" 
                className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
                placeholder="どんなメニューが美味しいですか？"
                value={description}
                onChange={(e)=>setDescription(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full mt-8" size="lg" disabled={loading}>
            {loading ? "登録処理中..." : "登録する"}
          </Button>
        </form>
      </div>
    </div>
  );
}

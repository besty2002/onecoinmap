"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, MapPin, Map } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const mockSaves = [
  {
    id: "1",
    name: "松屋 渋谷店",
    category: "ランチ",
    price: "500円",
    address: "東京都渋谷区...",
    image: "https://images.unsplash.com/photo-1542284992-cb31a89c4568?q=80&w=600&auto=format&fit=crop"
  }
];

export default function MyPage() {
  const router = useRouter();

  const handleLogout = () => {
    alert("ログアウトしました");
    router.push("/");
  };

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      {/* Profile Section */}
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start bg-card rounded-xl p-6 shadow-sm border">
        <Avatar className="h-24 w-24 shadow-sm border">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>UN</AvatarFallback>
        </Avatar>
        
        <div className="text-center md:text-left flex-1 space-y-2">
          <h1 className="text-2xl font-bold">Taro Yamada</h1>
          <p className="text-muted-foreground text-sm">taro.yamada@example.com</p>
          <div className="flex justify-center md:justify-start gap-4 text-sm mt-2 font-medium">
            <div>
              <span className="text-primary font-bold">12</span> 保存リスト
            </div>
            <div>
              <span className="text-primary font-bold">3</span> 登録済みのお店
            </div>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
          <Button variant="outline" className="flex-1 md:w-auto" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            設定
          </Button>
          <Button variant="ghost" className="text-destructive flex-1 md:w-auto" size="sm" onClick={handleLogout}>
            ログアウト
          </Button>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="saves" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="saves">お気に入り (保存)</TabsTrigger>
          <TabsTrigger value="posts">登録したお店</TabsTrigger>
        </TabsList>
        <TabsContent value="saves" className="mt-4 space-y-4">
          {mockSaves.map((place) => (
            <Link href={`/place/${place.id}`} key={place.id} className="block group">
              <Card className="overflow-hidden border shadow-sm group-hover:shadow-md transition-shadow">
                <div className="flex h-24">
                  <div className="w-24 relative flex-shrink-0 bg-muted">
                    <Image 
                      src={place.image} 
                      alt={place.name} 
                      fill 
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div className="p-3 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex justify-between">
                        <h3 className="font-semibold text-sm truncate">{place.name}</h3>
                        <Badge variant="secondary" className="text-[10px]">{place.price}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> {place.address}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
          <Button variant="outline" className="w-full flex items-center gap-2">
            <Map className="w-4 h-4" /> 地図からお店をさがす
          </Button>
        </TabsContent>
        <TabsContent value="posts" className="mt-4 p-8 text-center bg-muted/30 rounded-lg border border-dashed">
          <p className="text-muted-foreground mb-4">まだ登録したお店がありません</p>
          <Link href="/add">
            <Button>＋ お店を登録する</Button>
          </Link>
        </TabsContent>
      </Tabs>
    </div>
  );
}

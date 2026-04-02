import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid, Bookmark, Settings, Award, Star, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function MyProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { redirect("/login"); }

  // 🚀 유저 프로필 및 뱃지 정보 가져오기
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: myBadges } = await supabase.from("user_badges").select("*, badges(*)").eq("user_id", user.id);
  
  const { data: myPosts } = await supabase.from("places").select("*, place_images(image_url)").eq("user_id", user.id).order("created_at", { ascending: false });
  const { data: savedPosts } = await supabase.from("bookmarks").select("place_id, places(*, place_images(image_url))").eq("user_id", user.id);

  const stats = [
    { label: "게시물", value: myPosts?.length || 0 },
    { label: "저장됨", value: savedPosts?.length || 0 },
    { label: "레벨", value: profile?.level || 1 },
  ];

  // 🚀 다음 레벨까지 필요한 XP 계산 (100단위)
  const nextLevelXp = (profile?.level || 1) * 100;
  const currentLevelXp = profile?.xp || 0;
  const progressPercent = Math.min(((currentLevelXp % 100) / 100) * 100, 100);

  return (
    <div className="min-h-screen bg-white font-sans max-w-2xl mx-auto pb-20">
      {/* Header Section */}
      <div className="px-5 pt-8 pb-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[3px]">
                <div className="w-full h-full rounded-full bg-white p-1">
                <img src={profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"} className="w-full h-full rounded-full object-cover" alt="p" />
                </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-black text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white">
                Lv.{profile?.level || 1}
            </div>
          </div>
          <div className="flex flex-1 justify-around ml-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center font-bold">
                <div className="text-lg text-gray-900">{s.value}</div>
                <div className="text-[11px] text-gray-400 uppercase tracking-tighter">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-1.5">
            <div className="flex justify-between items-end">
                <h2 className="font-black text-xl text-gray-900">{profile?.nickname || user.email?.split('@')[0]}</h2>
                <span className="text-[10px] font-black text-primary uppercase italic">Next Lv.{ (profile?.level || 1) + 1} 까지 {100 - (currentLevelXp % 100)} XP</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">{profile?.bio || "원코인맵의 열혈 탐험가입니다! 최고의 가성비를 찾아서 🍲"}</p>
        </div>

        <div className="flex gap-2 pt-2">
          <Link href="/profile/edit" className="flex-1"><Button variant="secondary" className="w-full font-bold bg-gray-100 hover:bg-gray-200 border-none rounded-lg h-9 text-xs">프로필 편집</Button></Link>
          <Button variant="secondary" className="bg-gray-100 hover:bg-gray-200 border-none rounded-lg h-9 px-3"><Settings className="h-4 w-4 text-gray-500" /></Button>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full bg-transparent border-t border-gray-100 rounded-none h-12 p-0">
          <TabsTrigger value="posts" className="flex-1 h-full data-[state=active]:border-t-2 data-[state=active]:border-gray-900 data-[state=active]:bg-transparent rounded-none"><Grid className="h-5 w-5" /></TabsTrigger>
          <TabsTrigger value="saved" className="flex-1 h-full data-[state=active]:border-t-2 data-[state=active]:border-gray-900 data-[state=active]:bg-transparent rounded-none"><Bookmark className="h-5 w-5" /></TabsTrigger>
          <TabsTrigger value="badges" className="flex-1 h-full data-[state=active]:border-t-2 data-[state=active]:border-gray-900 data-[state=active]:bg-transparent rounded-none"><Award className="h-5 w-5" /></TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="m-0"><div className="grid grid-cols-3 gap-[1.5px]">{myPosts?.map((p: any) => (<Link href={`/place/${p.id}`} key={p.id} className="aspect-square relative overflow-hidden bg-gray-50"><img src={p.place_images?.[0]?.image_url || "/placeholder.jpg"} className="w-full h-full object-cover" alt="p" /></Link>))}</div></TabsContent>
        <TabsContent value="saved" className="m-0"><div className="grid grid-cols-3 gap-[1.5px]">{savedPosts?.map((item: any) => (<Link href={`/place/${item.places.id}`} key={item.places.id} className="aspect-square relative overflow-hidden bg-gray-50"><img src={item.places.place_images?.[0]?.image_url || "/placeholder.jpg"} className="w-full h-full object-cover" alt="p" /></Link>))}</div></TabsContent>
        
        {/* Badges Collection Tab */}
        <TabsContent value="badges" className="m-0 p-6">
            <div className="grid grid-cols-2 gap-4">
                {myBadges && myBadges.length > 0 ? myBadges.map((b: any) => (
                    <div key={b.id} className="p-4 rounded-3xl border border-gray-100 bg-gray-50/50 flex flex-col items-center text-center space-y-2">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-inner ${
                            b.badges.rarity === 'platinum' ? 'bg-indigo-100' :
                            b.badges.rarity === 'gold' ? 'bg-yellow-100' :
                            b.badges.rarity === 'silver' ? 'bg-slate-200' : 'bg-orange-100'
                        }`}>
                            <Star className={`h-7 w-7 ${
                                b.badges.rarity === 'platinum' ? 'text-indigo-600' :
                                b.badges.rarity === 'gold' ? 'text-yellow-600' :
                                b.badges.rarity === 'silver' ? 'text-slate-600' : 'text-orange-600'
                            }`} />
                        </div>
                        <h4 className="font-black text-sm text-gray-900 tracking-tight">{b.badges.name}</h4>
                        <p className="text-[10px] text-gray-400 font-medium leading-tight">{b.badges.description}</p>
                    </div>
                )) : (
                    <div className="col-span-2 py-10 text-center">
                        <Award className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm font-medium">활동을 시작하고 첫 번째 뱃지를 획득해 보세요!</p>
                    </div>
                )}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

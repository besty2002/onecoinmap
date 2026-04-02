import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid, Bookmark, Settings, MapPin } from "lucide-react";
import Link from "next/link";

export default async function MyProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 🚀 유저 프로필 정보 가져오기
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // 🚀 내가 올린 게시물 가져오기
  const { data: myPosts } = await supabase
    .from("places")
    .select("*, place_images(image_url)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // 🚀 내가 저장한 게시물 가져오기
  const { data: savedPosts } = await supabase
    .from("bookmarks")
    .select("place_id, places(*, place_images(image_url))")
    .eq("user_id", user.id);

  const stats = [
    { label: "게시물", value: myPosts?.length || 0 },
    { label: "저장됨", value: savedPosts?.length || 0 },
    { label: "좋아요", value: profile?.total_likes || 0 },
  ];

  return (
    <div className="min-h-screen bg-white font-sans max-w-2xl mx-auto pb-20">
      {/* Header */}
      <div className="px-5 pt-8 pb-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[3px]">
            <div className="w-full h-full rounded-full bg-white p-1">
              <img 
                src={profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"} 
                className="w-full h-full rounded-full object-cover"
                alt="profile"
              />
            </div>
          </div>
          <div className="flex flex-1 justify-around ml-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-black text-lg text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="font-black text-xl text-gray-900">{profile?.nickname || user.email}</h2>
          <p className="text-sm text-gray-600 font-medium leading-relaxed">
            {profile?.bio || "도쿄의 가성비 맛집을 찾아 떠나는 일상 🍜"}
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Link href="/profile/edit" className="flex-1">
            <Button variant="secondary" className="w-full font-bold bg-gray-100 hover:bg-gray-200 border-none rounded-lg h-9 text-sm">
              프로필 편집
            </Button>
          </Link>
          <Button variant="secondary" className="bg-gray-100 hover:bg-gray-200 border-none rounded-lg h-9 px-3">
             <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full bg-transparent border-t border-gray-100 rounded-none h-12 p-0">
          <TabsTrigger value="posts" className="flex-1 h-full data-[state=active]:border-t-2 data-[state=active]:border-gray-900 data-[state=active]:bg-transparent rounded-none">
            <Grid className="h-5 w-5" />
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex-1 h-full data-[state=active]:border-t-2 data-[state=active]:border-gray-900 data-[state=active]:bg-transparent rounded-none">
            <Bookmark className="h-5 w-5" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="m-0 focus-visible:ring-0">
          <div className="grid grid-cols-3 gap-[2px]">
            {myPosts?.map((post: any) => (
              <Link href={`/place/${post.id}`} key={post.id} className="aspect-square relative group overflow-hidden">
                <img 
                  src={post.place_images?.[0]?.image_url || "/placeholder.jpg"} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  alt="post"
                />
              </Link>
            ))}
          </div>
          {(!myPosts || myPosts.length === 0) && (
            <div className="py-20 text-center text-gray-400">
               <p className="font-bold text-sm">아직 올린 게시물이 없습니다.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="m-0 focus-visible:ring-0">
          <div className="grid grid-cols-3 gap-[2px]">
            {savedPosts?.map((item: any) => (
              <Link href={`/place/${item.places.id}`} key={item.places.id} className="aspect-square relative group overflow-hidden">
                <img 
                  src={item.places.place_images?.[0]?.image_url || "/placeholder.jpg"} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  alt="saved"
                />
              </Link>
            ))}
          </div>
          {(!savedPosts || savedPosts.length === 0) && (
            <div className="py-20 text-center text-gray-400">
               <p className="font-bold text-sm">저장된 맛집이 없습니다.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

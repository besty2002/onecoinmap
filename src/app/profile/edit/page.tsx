import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function EditProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 🚀 기존 프로필 정보 가져오기
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // 🚀 서버 액션: 프로필 업데이트
  async function updateProfile(formData: FormData) {
    "use server";
    const nickname = formData.get("nickname") as string;
    const bio = formData.get("bio") as string;
    const avatar_url = formData.get("avatar_url") as string;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("profiles")
        .update({ 
          nickname, 
          bio, 
          avatar_url,
          updated_at: new Date().toISOString() 
        })
        .eq("id", user.id);

      revalidatePath("/profile");
      redirect("/profile");
    }
  }

  // 🚀 서버 액션: 로그아웃
  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-white font-sans max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b">
        <Link href="/profile" className="p-1">
          <ChevronLeft className="h-6 w-6 text-gray-900" />
        </Link>
        <h1 className="text-base font-black flex-1 text-center">프로필 편집</h1>
        <div className="w-8"></div>
      </div>

      <form action={updateProfile} className="p-6 space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
             <img 
               src={profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"} 
               className="w-full h-full object-cover"
               alt="current-avatar"
             />
          </div>
          <Input 
            name="avatar_url" 
            placeholder="이미지 URL을 입력하세요" 
            defaultValue={profile?.avatar_url || ""} 
            className="text-xs h-8 text-center bg-transparent border-none text-primary font-bold focus-visible:ring-0"
          />
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nickname" className="text-xs font-bold text-gray-400">이름</Label>
            <Input 
              id="nickname" 
              name="nickname" 
              defaultValue={profile?.nickname || ""} 
              className="border-none bg-transparent border-b rounded-none px-0 py-2 focus-visible:ring-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-xs font-bold text-gray-400">소개</Label>
            <Textarea 
              id="bio" 
              name="bio" 
              defaultValue={profile?.bio || ""} 
              className="border-none bg-transparent border-b rounded-none px-0 py-2 focus-visible:ring-0 resize-none h-20"
              placeholder="소개를 입력해주세요..."
            />
          </div>
        </div>

        <div className="pt-8 space-y-4">
          <Button type="submit" className="w-full rounded-xl h-11 font-black bg-black text-white hover:bg-black/90 transition-all">
            저장하기
          </Button>
          
          <form action={signOut} className="w-full">
            <button type="submit" className="w-full text-center text-red-500 font-bold text-sm py-4 border-t hover:bg-gray-50 transition-all">
              로그아웃
            </button>
          </form>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, MoreHorizontal } from "lucide-react";
import Image from "next/image";

interface CommentSectionProps {
  placeId: string;
  currentUser: any;
}

export function CommentSection({ placeId, currentUser }: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const fetchComments = useCallback(async () => {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        profiles (display_name, avatar_url)
      `)
      .eq("place_id", placeId)
      .order("created_at", { ascending: true });

    if (!error && data) setComments(data);
  }, [placeId, supabase]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("comments")
      .insert({
        place_id: placeId,
        user_id: currentUser.id,
        content: newComment
      })
      .select(`
        *,
        profiles (display_name, avatar_url)
      `)
      .single();

    if (!error && data) {
      setComments(prev => [...prev, data]);
      setNewComment("");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 px-4 py-2 border-b">
        <MessageCircle className="h-5 w-5 text-gray-700" />
        <span className="font-bold text-sm">댓글 {comments.length}개</span>
      </div>

      <div className="space-y-4 px-4 max-h-[400px] overflow-y-auto no-scrollbar">
        {comments.map((c) => {
          // Supabase 조인 결과가 배열일 경우와 객체일 경우를 모두 처리
          const profile = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
          return (
            <div key={c.id} className="flex gap-3 text-sm group">
              <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden shrink-0 relative border">
                <Image 
                  src={profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100"} 
                  alt="v" fill className="object-cover" 
                />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">{profile?.display_name || "Voyager"}</span>
                  <span className="text-[10px] text-gray-400">
                      {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600 leading-relaxed">{c.content}</p>
              </div>
            </div>
          );
        })}
        {comments.length === 0 && (
          <div className="py-10 text-center text-gray-400 text-xs">
            아직 댓글이 없습니다. 첫 댓글을 남겨보세요! ✨
          </div>
        )}
      </div>

      {currentUser ? (
        <form onSubmit={handleSubmit} className="p-4 border-t sticky bottom-0 bg-white z-10 flex gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden shrink-0 relative">
             <Image src={currentUser.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100"} alt="me" fill className="object-cover" />
          </div>
          <div className="flex-1 relative">
            <Input 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="따뜻한 댓글을 남겨주세요..." 
              className="pr-12 rounded-full bg-gray-50 border-none h-9 text-sm"
              disabled={loading}
            />
            <button 
                type="submit" 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 disabled:text-gray-300"
                disabled={loading || !newComment.trim()}
            >
                <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 border-t text-center">
            <p className="text-xs text-gray-400">댓글을 작성하려면 로그인이 필요합니다.</p>
        </div>
      )}
    </div>
  );
}

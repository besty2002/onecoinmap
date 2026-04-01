import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Clock, Info, Heart, Share2, Tag, ChevronLeft, Navigation } from 'lucide-react';

import { getPlaceById } from '@/lib/supabase/queries';

// SEO를 위한 동적 Metadata 생성
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = await params;
  const place = await getPlaceById(id);
  
  return {
    title: `${place.name} - ${place.price_label} | ワンコインマップ`,
    description: place.description,
    openGraph: {
      images: [place.image],
    }
  };
}

export default async function PlaceDetail({ params }: { params: { id: string } }) {
  const { id } = await params;
  const place = await getPlaceById(id);

  if (!place) {
    return <div className="p-8 text-center text-muted-foreground mt-20">お店の情報を取得できませんでした。</div>;
  }

  const imageUrl = place.place_images?.[0]?.image_url || "https://images.unsplash.com/photo-1542284992-cb31a89c4568?q=80&w=800&auto=format&fit=crop";
  const authorName = place.profiles?.display_name || "名無しユーザー";
  const tags = place.tags || [];

  return (
    <div className="flex flex-col h-full bg-background md:max-w-3xl md:mx-auto w-full">
      {/* Mobile Header / Desktop Back Button */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b px-4 h-14 flex items-center md:hidden">
        <Link href="/">
          <Button variant="ghost" size="icon" className="-ml-2">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </Link>
        <span className="font-semibold text-lg ml-2 truncate">{place.name}</span>
      </div>
      
      {/* Hero Image */}
      <div className="relative w-full aspect-[4/3] md:aspect-[16/6] bg-muted">
        <Image 
          src={imageUrl} 
          alt={place.name} 
          fill 
          sizes="(max-width: 768px) 100vw, 768px"
          priority
          className="object-cover"
        />
        <div className="absolute top-4 left-4 hidden md:block z-10">
          <Link href="/">
            <Button variant="secondary" size="icon" className="rounded-full shadow-md bg-white/80 hover:bg-white text-black">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-5 flex-1 space-y-6">
        {/* Header Info */}
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold leading-tight">{place.name}</h1>
            <div className="flex gap-2 shrink-0 ml-4">
              <Button variant="outline" size="icon" className="rounded-full">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-primary/20 hover:bg-primary/5 text-primary">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
            <Badge variant="default" className="text-sm px-2 py-0.5 bg-primary/10 text-primary border-none">
              {place.price_label}
            </Badge>
            <span className="bg-secondary px-2 py-0.5 rounded text-secondary-foreground text-xs font-medium">
              {place.category}
            </span>
            <span>⭐ {place.rating}</span>
            <span>❤️ {place.saves} お気に入り</span>
          </div>
        </div>

        <Separator />

        {/* Location / Action */}
        <div className="space-y-4">
          <div className="flex bg-muted/50 p-4 rounded-xl items-center justify-between">
            <div className="flex gap-3 items-start flex-1 text-sm">
              <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">{place.address}</p>
                <p className="text-muted-foreground text-xs mt-1">Google Maps で開く</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="ml-2 whitespace-nowrap">
              <Navigation className="h-4 w-4 mr-1" />
              案内
            </Button>
          </div>
          {/* Static Map Placeholder */}
          <div className="w-full h-40 bg-muted rounded-xl flex items-center justify-center border border-dashed border-muted-foreground/30">
            <p className="text-muted-foreground text-sm font-medium">地図エリア</p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2 text-base">
            <Info className="h-4 w-4 text-muted-foreground" /> 
            お店について
          </h3>
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {place.description}
          </p>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2 text-base">
            <Tag className="h-4 w-4 text-muted-foreground" /> 
            特徴・タグ
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: any) => (
              <Badge key={tag} variant="outline" className="bg-background">#{tag.name}</Badge>
            ))}
            {tags.length === 0 && <span className="text-xs text-muted-foreground">登録されたタグはありません</span>}
          </div>
        </div>
        
        {/* Footer Info */}
        <div className="text-xs text-muted-foreground text-right pt-6 pb-20 md:pb-6">
          <p>登録者: {authorName}</p>
          <p>更新: {new Date(place.created_at).toLocaleDateString('ja-JP')}</p>
        </div>
      </div>
{/* Navigation import needs to be valid */}
    </div>
  );
}

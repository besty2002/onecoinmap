import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";

// Google Places API configuration
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
const PLACES_API_URL = "https://places.googleapis.com/v1/places:searchText";

// Supabase configuration
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const MY_SERVICE_ROLE_KEY = Deno.env.get("MY_SERVICE_ROLE_KEY");

// 🚀 Google Quota Limit (데이터 유입량을 조절할 수 있습니다)
const MAX_TOTAL_PLACES = 50; 

// 🚀 Query Optimization (저렴하고 맛있는 가성비 식당 위주 검색)
const SEARCH_QUERIES = [
  "500円 ラン치 東京",
  "ワンコイン ラーメン 東京",
  "安くて美味しい お弁当 東京",
  "激安 ラン치 浅草",
  "1000円以下 グルメ 北千住"
];

const BUCKET_NAME = "place-images";

// 🚀 [최종 현지화] 앱의 카테고리 명칭과 100% 일치하도록 매핑 수정
function mapCategory(googleType: string | undefined): string {
  if (!googleType) return "定食・和食"; 
  
  const type = googleType.toLowerCase();
  
  // 1. 도시락/반찬 (Bento)
  if (type.includes("bento") || type.includes("delica")) return "お弁当";
  
  // 2. 라멘/면 (Ramen/Noodles)
  if (type.includes("ramen") || type.includes("noodle") || type.includes("soba") || type.includes("udon")) return "ラーメン・麺";
  
  // 3. 규동/카레 (Donburi/Curry)
  if (type.includes("curry") || type.includes("gyudon") || type.includes("beef_bowl")) return "牛丼・カレー";
  
  // 4. 중식 (Chinese)
  if (type.includes("chinese")) return "中華料理";
  
  // 5. 한식 (Korean)
  if (type.includes("korean")) return "韓国料理";
  
  // 6. 양식/파스타 (Western/Pasta)
  if (type.includes("italian") || type.includes("french") || type.includes("pasta") || type.includes("pizza") || type.includes("western")) return "洋食・パスタ";
  
  // 7. 버거/치킨/피자 (Fast Food)
  if (type.includes("hamburger") || type.includes("fast_food") || type.includes("sandwich")) return "バーガー";
  if (type.includes("chicken")) return "チ킨";
  if (type.includes("pizza")) return "ピザ";
  
  // 8. 야키니쿠/돈부리 (Meat/Bowl)
  if (type.includes("yakiniku") || type.includes("steak") || type.includes("barbecue") || type.includes("meat")) return "焼肉・丼";
  
  // 9. 샐러드 (Salad)
  if (type.includes("salad") || type.includes("vegetarian") || type.includes("vegan")) return "サラダ";
  
  // 10. 카페 (Cafe)
  if (type.includes("cafe") || type.includes("coffee") || type.includes("tea")) return "カフェ";

  // 11. 아시안 (Asian)
  if (type.includes("thai") || type.includes("vietnamese") || type.includes("indian") || type.includes("asian")) return "アジアン";

  // 12. 반찬/빵 (Side dish/Bakery)
  if (type.includes("bakery") || type.includes("pastry") || type.includes("bread")) return "惣菜・パン";

  // 기본값: 정식/일식 (Teishoku/Japanese)
  return "定食・和食";
}

interface GooglePlace {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  businessStatus?: string;
  primaryType?: string;
  photos?: Array<{ name: string; widthPx: number; heightPx: number }>;
}

serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || authHeader !== `Bearer ${MY_SERVICE_ROLE_KEY}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  if (!GOOGLE_API_KEY || !SUPABASE_URL || !MY_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Missing environment variables" }), { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, MY_SERVICE_ROLE_KEY);
  let totalProcessed = 0;

  try {
    for (const query of SEARCH_QUERIES) {
      if (totalProcessed >= MAX_TOTAL_PLACES) break;

      const response = await fetch(PLACES_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_API_KEY,
          "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.businessStatus,places.primaryType,places.photos"
        },
        body: JSON.stringify({ textQuery: query, languageCode: "ja" })
      });

      const data = await response.json();
      const places: GooglePlace[] = data.places || [];

      for (const place of places) {
        if (totalProcessed >= MAX_TOTAL_PLACES) break;

        const { data: existingPlace } = await supabase
          .from("places")
          .select("id")
          .eq("google_place_id", place.id)
          .maybeSingle();

        const isNewPlace = !existingPlace;
        const mappedCategory = mapCategory(place.primaryType);

        // RPC 함수 호출 (스키마가 동기화된 버전을 사용합니다)
        const { data: placeId, error: placeError } = await supabase.rpc('upsert_place_from_google', {
          p_google_place_id: place.id,
          p_name: place.displayName?.text || "Unknown",
          p_lat: place.location?.latitude || 0,
          p_lng: place.location?.longitude || 0,
          p_category: mappedCategory,
          p_price_label: "500円~",
          p_price_value: 500,
          p_prefecture: "Tokyo",
          p_city: "Tokyo",
          p_google_primary_type: place.primaryType || null,
          p_rating: place.rating || null,
          p_user_rating_count: place.userRatingCount || null,
          p_google_maps_uri: place.googleMapsUri || null,
          p_business_status: place.businessStatus || null,
          p_formatted_address: place.formattedAddress || null
        });

        if (placeError) {
          console.error(`Error processing ${place.id}:`, placeError.message);
          continue;
        }

        if (isNewPlace && place.photos && place.photos.length > 0) {
          const photo = place.photos[0];
          const photoUrl = `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=400&maxWidthPx=400&key=${GOOGLE_API_KEY}`;
          const imageRes = await fetch(photoUrl);
          
          if (imageRes.ok && imageRes.body) {
            const storagePath = `google-places/${place.id}/0.jpg`;
            const { error: uploadError } = await supabase.storage
              .from(BUCKET_NAME)
              .upload(storagePath, await imageRes.body, { contentType: 'image/jpeg', upsert: true });

            if (!uploadError) {
              const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
              await supabase.rpc('upsert_place_photo', {
                p_place_id: placeId,
                p_google_photo_name: photo.name,
                p_storage_bucket: BUCKET_NAME,
                p_storage_path: storagePath,
                p_source_url: publicUrlData.publicUrl,
                p_width_px: photo.widthPx,
                p_height_px: photo.heightPx,
                p_sort_order: 0,
                p_is_primary: true
              });
            }
          }
        }
        
        totalProcessed++;
      }
    }

    return new Response(JSON.stringify({ success: true, processed: totalProcessed }), { status: 200 });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});

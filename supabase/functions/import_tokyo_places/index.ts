import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";

// Google Places API configuration
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
const PLACES_API_URL = "https://places.googleapis.com/v1/places:searchText";

// Supabase configuration
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const MY_SERVICE_ROLE_KEY = Deno.env.get("MY_SERVICE_ROLE_KEY");

// 🚀 Google Quota Limit: 하루 처리할 최대 장소 개수를 정하여 통제
const MAX_TOTAL_PLACES = 50; 

// 🚀 Query Optimization: 1~2개로 축소
const SEARCH_QUERIES = [
  "500\u5186 \u30e9\u30f3\u30c1 \u6771\u4eac",        // 500円 ラン치 東京
  "\u30ef\u30f3\u30b3\u30a4\u30f3 \u30e9\u30fc\u30e1\u30f3 \u6771\u4eac" // ワンコイン ラーメン 東京
];

const BUCKET_NAME = "place-images";

// 🚀 지능형 카테고리 매핑 함수
function mapCategory(googleType: string | undefined): string {
  if (!googleType) return "\uac1d\ud0c0 \uc2dd\ub2f9"; // 기타 식당
  
  const type = googleType.toLowerCase();
  
  if (type.includes("ramen")) return "\ub77c\uba58"; // 라멘
  if (type.includes("cafe") || type.includes("coffee") || type.includes("bakery") || type.includes("pastry")) return "\uce74\ud3e8\u00b7\ubca0\uc774\ucee4\ub9ac"; // 카페·베이커리
  if (type.includes("sushi")) return "\uc2a4\uc2dc\u00b7\uc77c\uc2dd"; // 스시·일식
  if (type.includes("izakaya") || type.includes("bar") || type.includes("pub")) return "\uc774\uc790\uce74\uc57c\u00b7\uc220\uc9d1"; // 이자카야·술집
  if (type.includes("fast_food") || type.includes("hamburger") || type.includes("sandwich")) return "\ud328\uc2a4\ud2b8\ud478\ub4dc"; // 패스트푸드
  if (type.includes("japanese")) return "\uc77c\uc2dd"; // 일식
  if (type.includes("chinese")) return "\uc911\uc2dd"; // 중식
  if (type.includes("korean")) return "\ud55c\uc2dd"; // 한식
  if (type.includes("italian") || type.includes("french") || type.includes("western")) return "\uc591\uc2dd"; // 양식
  
  return "\uc2dd\ub2f9"; // 식당
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

        // --- 1. 신규 장소 여부 체크 ---
        const { data: existingPlace } = await supabase
          .from("places")
          .select("id")
          .eq("google_place_id", place.id)
          .maybeSingle();

        const isNewPlace = !existingPlace;

        // --- 2. 카테고리 매핑 로직 적용 ---
        const mappedCategory = mapCategory(place.primaryType);

        // --- 3. 기본 정보 Upsert ---
        const { data: placeId, error: placeError } = await supabase.rpc('upsert_place_from_google', {
          p_google_place_id: place.id,
          p_name: place.displayName?.text || "Unknown",
          p_lat: place.location?.latitude || 0,
          p_lng: place.location?.longitude || 0,
          p_category: mappedCategory, // 수정됨: 매핑된 카테고리 저장
          p_price_label: "500\uc6d0~",
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

        if (placeError) continue;

        // --- 4. 신규 장소일 경우에만 사진 수집 ---
        if (isNewPlace && place.photos && place.photos.length > 0) {
          const photo = place.photos[0];
          const photoUrl = `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=400&maxWidthPx=400&key=${GOOGLE_API_KEY}`;
          const imageRes = await fetch(photoUrl);
          
          if (imageRes.ok && imageRes.body) {
            const storagePath = `google-places/${place.id}/0.jpg`;
            const { error: uploadError } = await supabase.storage
              .from(BUCKET_NAME)
              .upload(storagePath, await imageRes.blob(), { contentType: 'image/jpeg', upsert: true });

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

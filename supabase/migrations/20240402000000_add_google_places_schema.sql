-- 1. Extend `places` table
ALTER TABLE places
ADD COLUMN IF NOT EXISTS google_place_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'google_places',
ADD COLUMN IF NOT EXISTS google_primary_type TEXT,
ADD COLUMN IF NOT EXISTS rating NUMERIC,
ADD COLUMN IF NOT EXISTS user_rating_count INTEGER,
ADD COLUMN IF NOT EXISTS google_maps_uri TEXT,
ADD COLUMN IF NOT EXISTS business_status TEXT,
ADD COLUMN IF NOT EXISTS formatted_address TEXT,
ADD COLUMN IF NOT EXISTS photo_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ,
-- also ensure these fields needed by the data processing logic exist
ADD COLUMN IF NOT EXISTS price_label TEXT,
ADD COLUMN IF NOT EXISTS price_value INTEGER,
ADD COLUMN IF NOT EXISTS prefecture TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- 2. Create `place_photos` table
CREATE TABLE IF NOT EXISTS place_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  google_photo_name TEXT UNIQUE,
  storage_bucket TEXT,
  storage_path TEXT,
  source_url TEXT,
  width_px INTEGER,
  height_px INTEGER,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Storage Setup (assuming 'storage' schema exists via Supabase)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('place-images', 'place-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('user-place-images', 'user-place-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for place-images bucket
-- Note: Drops the policy first to make the script idempotent
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public Access place-images" ON storage.objects;
  DROP POLICY IF EXISTS "Service Role Insert place-images" ON storage.objects;
  DROP POLICY IF EXISTS "Service Role Update place-images" ON storage.objects;
  DROP POLICY IF EXISTS "Service Role Delete place-images" ON storage.objects;
  
  DROP POLICY IF EXISTS "Public Access user-place-images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users Insert user-place-images" ON storage.objects;
END $$;

CREATE POLICY "Public Access place-images" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'place-images' );

CREATE POLICY "Service Role Insert place-images" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'place-images' ); -- Service role bypasses RLS, but if relying on RLS, this allows it.

-- RLS Policies for user-place-images bucket
CREATE POLICY "Public Access user-place-images" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'user-place-images' );

CREATE POLICY "Authenticated users Insert user-place-images" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'user-place-images' AND auth.role() = 'authenticated' );

-- 4. RPC upsert_place_from_google
CREATE OR REPLACE FUNCTION upsert_place_from_google(
  p_google_place_id TEXT,
  p_name TEXT,
  p_lat NUMERIC,
  p_lng NUMERIC,
  p_category TEXT,
  p_price_label TEXT,
  p_price_value INTEGER,
  p_prefecture TEXT,
  p_city TEXT,
  p_google_primary_type TEXT,
  p_rating NUMERIC,
  p_user_rating_count INTEGER,
  p_google_maps_uri TEXT,
  p_business_status TEXT,
  p_formatted_address TEXT
) RETURNS UUID AS $$
DECLARE
  v_place_id UUID;
  v_slug TEXT;
BEGIN
  -- Simple slug generation (lowercase, remove non alphanumeric, append short place_id)
  v_slug := regexp_replace(lower(p_name), '[^a-z0-9]+', '-', 'g') || '-' || substring(p_google_place_id from 1 for 6);
  
  INSERT INTO places (
    google_place_id, name, slug, lat, lng, category, price_label, price_value,
    prefecture, city, source, google_primary_type, rating, user_rating_count,
    google_maps_uri, business_status, formatted_address, last_synced_at
  ) VALUES (
    p_google_place_id, p_name, v_slug, p_lat, p_lng, p_category, p_price_label, p_price_value,
    p_prefecture, p_city, 'google_places', p_google_primary_type, p_rating, p_user_rating_count,
    p_google_maps_uri, p_business_status, p_formatted_address, now()
  )
  ON CONFLICT (google_place_id) DO UPDATE SET
    name = EXCLUDED.name,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    category = EXCLUDED.category,
    price_label = EXCLUDED.price_label,
    price_value = EXCLUDED.price_value,
    prefecture = EXCLUDED.prefecture,
    city = EXCLUDED.city,
    google_primary_type = EXCLUDED.google_primary_type,
    rating = EXCLUDED.rating,
    user_rating_count = EXCLUDED.user_rating_count,
    google_maps_uri = EXCLUDED.google_maps_uri,
    business_status = EXCLUDED.business_status,
    formatted_address = EXCLUDED.formatted_address,
    last_synced_at = now()
  RETURNING id INTO v_place_id;

  RETURN v_place_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. RPC upsert_place_photo
CREATE OR REPLACE FUNCTION upsert_place_photo(
  p_place_id UUID,
  p_google_photo_name TEXT,
  p_storage_bucket TEXT,
  p_storage_path TEXT,
  p_source_url TEXT,
  p_width_px INTEGER,
  p_height_px INTEGER,
  p_sort_order INTEGER,
  p_is_primary BOOLEAN
) RETURNS UUID AS $$
DECLARE
  v_photo_id UUID;
BEGIN
  INSERT INTO place_photos (
    place_id, google_photo_name, storage_bucket, storage_path, source_url, 
    width_px, height_px, sort_order, is_primary, created_at
  ) VALUES (
    p_place_id, p_google_photo_name, p_storage_bucket, p_storage_path, p_source_url,
    p_width_px, p_height_px, p_sort_order, p_is_primary, now()
  )
  ON CONFLICT (google_photo_name) DO UPDATE SET
    place_id = EXCLUDED.place_id,
    storage_bucket = EXCLUDED.storage_bucket,
    storage_path = EXCLUDED.storage_path,
    source_url = EXCLUDED.source_url,
    width_px = EXCLUDED.width_px,
    height_px = EXCLUDED.height_px,
    sort_order = EXCLUDED.sort_order,
    is_primary = EXCLUDED.is_primary
  RETURNING id INTO v_photo_id;
  
  -- Update the photo_count in the parent places table
  UPDATE places 
  SET photo_count = (SELECT count(*) FROM place_photos WHERE place_id = p_place_id)
  WHERE id = p_place_id;

  RETURN v_photo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

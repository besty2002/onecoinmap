import { createClient } from "./server";

export async function getPlaces() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("places")
    .select("*, place_images(image_url)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching places:", error);
    return [];
  }
  return data;
}

export async function getPlaceById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("places")
    .select(`
      *,
      profiles (display_name),
      place_images (image_url)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching place by id:", error);
    return null;
  }
  return data;
}

export async function getUserSaves(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saves")
    .select(`
      id,
      place_id,
      places (*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching saves:", error);
    return [];
  }
  return data;
}

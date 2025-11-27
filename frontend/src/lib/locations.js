const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export async function searchAddresses(query) {
  if (!query || query.trim().length < 3) return [];

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query
  )}.json?autocomplete=true&limit=5&types=poi,address,place&proximity=-79.3832,43.6532&country=CA&access_token=${MAPBOX_TOKEN}`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error("Mapbox search failed", await res.text());
    return [];
  }

  const data = await res.json();

  return (data.features || []).map((f) => ({
    id: f.id,
    label: f.place_name,           // full address string
    coordinates: f.center,         // [lng, lat]
  }));
}

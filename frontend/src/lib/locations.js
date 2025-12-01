const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export async function searchAddresses(query) {
  const q = query.trim();
  if (!q || !MAPBOX_TOKEN) return [];

  const params = new URLSearchParams({
    q,
    access_token: MAPBOX_TOKEN,
    session_token: "static-session", 
    language: "en",
    country: "ca",
    proximity: "-79.3957,43.6629",
    limit: "5",
  });

  const url = `https://api.mapbox.com/search/searchbox/v1/suggest?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error("Mapbox suggest failed:", res.status, res.statusText);
    return [];
  }

  const data = await res.json();
  const suggestions = data.suggestions || [];

  return suggestions.map((s) => {
    const label =
      s.name && s.place_formatted
        ? `${s.name}, ${s.place_formatted}`
        : s.full_address || s.name || "";

    const coordinates =
      s.coordinate && typeof s.coordinate.longitude === "number"
        ? [s.coordinate.longitude, s.coordinate.latitude]
        : null;

    return {
      id: s.mapbox_id,
      label,
      coordinates,
      raw: s,
    };
  });
}

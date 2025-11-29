import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export function EventMap({ lng, lat }) {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: 15,
    });

    // Add zoom / rotation controls
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Marker at event location
    new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);

    // Cleanup on unmount
    return () => {
      map.remove();
    };
  }, [lng, lat]);

  return (
    <div
      ref={mapContainerRef}
      className="event-detail-map"
      style={{ width: "100%", height: "300px", borderRadius: "8px", overflow: "hidden" }}
    />
  );
}

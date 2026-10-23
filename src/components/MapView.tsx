import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { PlaceItem } from "../types/auth";

type FilterType = "todos" | "gastronomia" | "cultura" | "naturaleza" | "aventura";

interface MapViewProps {
  places: PlaceItem[];
  onBack: () => void;
}

const filterButtons: { key: FilterType; label: string; color: string }[] = [
  { key: "todos", label: "Todos", color: "#37474F" },
  { key: "gastronomia", label: "Gastronomía", color: "#F7931E" },
  { key: "cultura", label: "Cultura", color: "#7B1FA2" },
  { key: "naturaleza", label: "Naturaleza", color: "#4CAF50" },
  { key: "aventura", label: "Aventura", color: "#0097A7" },
];

export function MapView({ places, onBack }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>("todos");

  useEffect(() => {
    if (!mapContainer.current) return;

    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!mapboxToken) {
      console.error("Mapbox token not found");
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [-66.1569, -17.3739],
      zoom: 13,
      pitch: 45,
      bearing: 0,
    });

    map.current = mapInstance;

    mapInstance.on("load", () => {
      console.log("Map loaded successfully");
    });

    mapInstance.on("error", (e) => {
      console.error("Map error:", e);
    });

    mapInstance.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    mapInstance.addControl(new mapboxgl.FullscreenControl(), "top-right");

    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    });

    mapInstance.addControl(geolocateControl, "bottom-right");

    geolocateControl.on("geolocate", (e) => {
      const coords = e.coords as GeolocationCoordinates;
      mapInstance.flyTo({
        center: [coords.longitude, coords.latitude],
        zoom: 15,
        essential: true,
      });
    });

    geolocateControl.on("error", (e) => {
      console.error("Geolocation error:", e);
    });

    setTimeout(() => {
      geolocateControl.trigger();
    }, 1000);

    return () => {
      mapInstance.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const filteredPlaces =
      activeFilter === "todos"
        ? places
        : places.filter((place) => place.category === activeFilter);

    filteredPlaces.forEach((place) => {
      if (!place.coordinates) return;

      const color = getCategoryColor(place.category);

      const markerElement = document.createElement("div");
      markerElement.style.cssText = `
        width: 20px;
        height: 20px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
        position: relative;
      `;

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat(place.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 12, closeButton: false }).setHTML(`
            <div style="padding: 10px; min-width: 200px; border-radius: 6px;">
              <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #37474F;">${place.title}</h3>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #6D4C41;">${place.area}</p>
              <div style="display: flex; gap: 6px; align-items: center;">
                <span style="font-size: 10px; background: ${color}; color: white; padding: 3px 8px; border-radius: 10px; font-weight: bold;">${place.tag}</span>
                <span style="font-size: 11px; color: #6D4C41; font-weight: 600;">⭐ ${place.rating}</span>
              </div>
            </div>
          `)
        )
        .addTo(map.current);

      markersRef.current.push(marker);
    });
  }, [places, activeFilter]);

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      gastronomia: "#F7931E",
      cultura: "#7B1FA2",
      naturaleza: "#D81B60",
      aventura: "#0097A7",
    };
    return colors[category] || "#37474F";
  };

  const handleFilterClick = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur shadow-sm border-b border-[#E2D9CC]">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-5 lg:px-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-subtitle font-bold text-[#37474F] hover:text-[#D81B60] transition"
          >
            <span className="rotate-180">→</span> Volver
          </button>
          <h1 className="font-subtitle text-lg font-bold text-[#37474F]">
            Mapa Interactivo
          </h1>
          <div className="w-32" />
        </div>
      </header>

      <div className="relative">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 flex-wrap justify-center px-4 max-w-[1240px]">
          {filterButtons.map((filter) => (
            <button
              key={filter.key}
              onClick={() => handleFilterClick(filter.key)}
              className={`px-5 py-2.5 rounded-full font-subtitle text-xs font-bold transition shadow-md ${
                activeFilter === filter.key
                  ? "text-white"
                  : "bg-white text-[#37474F] border border-[#E2D9CC]"
              }`}
              style={
                activeFilter === filter.key
                  ? { backgroundColor: filter.color, boxShadow: `0 4px 12px ${filter.color}40` }
                  : undefined
              }
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div ref={mapContainer} className="h-[calc(100vh-64px)] w-full" />
      </div>
    </div>
  );
}

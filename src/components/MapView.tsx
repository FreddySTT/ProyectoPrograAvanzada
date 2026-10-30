import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import type { PlaceItem } from "../types/auth";

type FilterType = "todos" | "gastronomia" | "cultura" | "naturaleza" | "aventura";
type TravelMode = "driving" | "walking";

interface MapViewProps {
  places: PlaceItem[];
  onBack: () => void;
}

const DEFAULT_COCHABAMBA_COORDS: [number, number] = [-66.1568, -17.3935]; // Plaza 14 de Septiembre

const filterButtons: { key: FilterType; label: string; color: string; icon: string }[] = [
  { key: "todos", label: "Todos", color: "#37474F", icon: "🗺️" },
  { key: "gastronomia", label: "Gastronomía", color: "#2563EB", icon: "🍽️" },
  { key: "cultura", label: "Cultura", color: "#7B1FA2", icon: "🎭" },
  { key: "naturaleza", label: "Naturaleza", color: "#16A34A", icon: "🌿" },
  { key: "aventura", label: "Aventura", color: "#0097A7", icon: "🧗" },
];

function calculateDistanceKm(coord1: [number, number], coord2: [number, number]): number {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function MapView({ places, onBack }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const [activeFilter, setActiveFilter] = useState<FilterType>("todos");
  const [userLocation, setUserLocation] = useState<[number, number]>(DEFAULT_COCHABAMBA_COORDS);
  const [isLiveLocation, setIsLiveLocation] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceItem | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>("driving");
  const [routeInfo, setRouteInfo] = useState<{
    distanceKm: number;
    durationMin: number;
  } | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Obtain user's real-time GPS coordinates
  useEffect(() => {
    if (!navigator.geolocation) return;

    const onSuccess = (pos: GeolocationPosition) => {
      const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
      setUserLocation(coords);
      setIsLiveLocation(true);
    };

    const onError = (err: GeolocationPositionError) => {
      console.warn("GPS Real-time error, using default Cochabamba center:", err.message);
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 8000,
    });

    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 10000,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainer.current) return;

    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!mapboxToken) {
      console.error("Mapbox token not found in .env");
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: userLocation,
      zoom: 13,
      pitch: 0,
      maxPitch: 0,
      bearing: 0,
    });

    map.current = mapInstance;

    mapInstance.on("load", () => {
      // Find the first symbol/label layer so the route is drawn UNDER street names and labels
      const layers = mapInstance.getStyle().layers;
      let firstSymbolId: string | undefined;
      if (layers) {
        for (const layer of layers) {
          if (layer.type === "symbol") {
            firstSymbolId = layer.id;
            break;
          }
        }
      }

      // Add empty route GeoJSON source and layer
      if (!mapInstance.getSource("route-source")) {
        mapInstance.addSource("route-source", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        // Soft navigation blue line (placed strictly under street names & labels)
        mapInstance.addLayer(
          {
            id: "route-line",
            type: "line",
            source: "route-source",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#3B82F6",
              "line-width": 4.2,
              "line-opacity": 0.65,
            },
          },
          firstSymbolId
        );
      }
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
      const userCoords: [number, number] = [coords.longitude, coords.latitude];
      setUserLocation(userCoords);
      setIsLiveLocation(true);
    });

    const timer = setTimeout(() => {
      try {
        geolocateControl.trigger();
      } catch {
        // safe
      }
    }, 1200);

    return () => {
      clearTimeout(timer);
      mapInstance.remove();
    };
  }, []);

  // Fetch Route from Mapbox Directions API
  const fetchAndDrawRoute = useCallback(
    async (destination: PlaceItem, mode: TravelMode = travelMode) => {
      if (!destination.coordinates || !map.current) return;

      const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
      if (!mapboxToken) return;

      setIsLoadingRoute(true);
      setRouteError(null);

      const [origLng, origLat] = userLocation;
      const [destLng, destLat] = destination.coordinates;

      const profile = mode === "walking" ? "walking" : "driving";
      const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${origLng},${origLat};${destLng},${destLat}?geometries=geojson&overview=full&steps=true&access_token=${mapboxToken}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
          const durationMin = Math.round(route.duration / 60);

          setRouteInfo({ distanceKm, durationMin });

          // Render route on map
          const mapInstance = map.current;
          const source = mapInstance.getSource("route-source") as mapboxgl.GeoJSONSource | undefined;

          if (source) {
            source.setData({
              type: "Feature",
              properties: {},
              geometry: route.geometry,
            });

            // Force layer to be on top of everything else
            if (mapInstance.getLayer("route-line")) {
              try {
                mapInstance.removeLayer("route-line");
              } catch (e) {
                // layer might not exist
              }
            }

            mapInstance.addLayer({
              id: "route-line",
              type: "line",
              source: "route-source",
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#00BFFF",
                "line-width": 6,
                "line-opacity": 0.7,
              },
            });
          }

          // Fit bounds to show entire route with padding
          const coordinates = route.geometry.coordinates as [number, number][];
          const bounds = coordinates.reduce(
            (b, coord) => b.extend(coord),
            new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
          );

          mapInstance.fitBounds(bounds, {
            padding: { top: 90, bottom: 220, left: 60, right: 60 },
            maxZoom: 16,
            duration: 1200,
          });
        } else {
          throw new Error("No se encontró una ruta vial.");
        }
      } catch (err) {
        // Fallback to straight line
        const straightDistance = calculateDistanceKm(userLocation, destination.coordinates);
        setRouteInfo({
          distanceKm: straightDistance,
          durationMin: Math.round((straightDistance / (mode === "walking" ? 4.5 : 30)) * 60),
        });

        const mapInstance = map.current;
        const source = mapInstance.getSource("route-source") as mapboxgl.GeoJSONSource | undefined;
        if (source) {
          source.setData({
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [userLocation, destination.coordinates],
            },
          });
        }
      } finally {
        setIsLoadingRoute(false);
      }
    },
    [userLocation, travelMode]
  );

  // Clear current route from map
  const clearRoute = useCallback(() => {
    setSelectedPlace(null);
    setRouteInfo(null);
    if (!map.current) return;
    const source = map.current.getSource("route-source") as mapboxgl.GeoJSONSource | undefined;
    if (source) {
      source.setData({
        type: "FeatureCollection",
        features: [],
      });
    }
  }, []);

  // Filter Handling: If Gastronomía is selected, automatically route to the closest place!
  const handleFilterClick = useCallback((filter: FilterType) => {
    setActiveFilter(filter);

    if (filter === "gastronomia") {
      const gastroPlaces = places.filter(
        (p) => p.category === "gastronomia" && p.coordinates
      );

      if (gastroPlaces.length > 0) {
        // Calculate closest place to userLocation
        let closest = gastroPlaces[0];
        let minDistance = Infinity;

        gastroPlaces.forEach((p) => {
          if (p.coordinates) {
            const dist = calculateDistanceKm(userLocation, p.coordinates);
            if (dist < minDistance) {
              minDistance = dist;
              closest = p;
            }
          }
        });

        setSelectedPlace(closest);
        fetchAndDrawRoute(closest);
      }
    } else {
      // Clear route when switching to other filters
      clearRoute();
    }
  }, [places, userLocation, clearRoute, fetchAndDrawRoute]);

  // Center camera on active route
  const handleCenterRoute = () => {
    if (!map.current || !selectedPlace?.coordinates) return;
    const bounds = new mapboxgl.LngLatBounds(userLocation, userLocation);
    bounds.extend(selectedPlace.coordinates);
    map.current.fitBounds(bounds, {
      padding: { top: 90, bottom: 220, left: 60, right: 60 },
      maxZoom: 16,
      duration: 1000,
    });
  };

  // Re-render place markers whenever places, filter, or selectedPlace changes
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

      const isSelected = selectedPlace?.id === place.id;
      const color = getCategoryColor(place.category);
      const distFromUser = calculateDistanceKm(userLocation, place.coordinates);

      const markerContainer = document.createElement("div");
      markerContainer.className = "riqsi-custom-marker";
      markerContainer.style.cssText = "position: absolute; cursor: pointer; user-select: none;";

      const innerBadge = document.createElement("div");
      innerBadge.style.cssText = `
        width: ${isSelected ? "22px" : "18px"};
        height: ${isSelected ? "22px" : "18px"};
        background-color: ${color};
        opacity: 1 !important;
        border: 2.5px solid #FFFFFF;
        border-radius: 50%;
        box-shadow: ${isSelected ? `0 0 0 4px ${color}60, 0 4px 10px rgba(0,0,0,0.45)` : "0 2px 6px rgba(0,0,0,0.35)"};
        display: block;
        transform: translate(-50%, -50%);
        user-select: none;
      `;
      innerBadge.innerHTML = "";
      markerContainer.appendChild(innerBadge);

      const marker = new mapboxgl.Marker({ element: markerContainer, anchor: "center" })
        .setLngLat(place.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 16, closeButton: false }).setHTML(`
            <div style="padding: 10px; min-width: 220px; font-family: sans-serif; border-radius: 10px;">
              <div style="position: relative; height: 95px; margin: -10px -10px 10px -10px; border-radius: 10px 10px 0 0; overflow: hidden; background: #EEE;">
                <img src="${place.image}" alt="${place.title}" style="width: 100%; height: 100%; object-fit: cover;" />
                <span style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.65); color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700;">
                  ⭐ ${place.rating}
                </span>
              </div>
              <h3 style="margin: 0 0 3px 0; font-size: 14px; font-weight: 800; color: #1E293B;">${place.title}</h3>
              <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748B;">📍 ${place.area}</p>
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-top: 8px; border-top: 1px solid #E2E8F0; pt: 6px;">
                <span style="font-size: 11px; color: #2563EB; font-weight: 700;">A ${distFromUser} km de ti</span>
                <span style="font-size: 10px; background: ${color}; color: white; padding: 2px 8px; border-radius: 8px; font-weight: 700;">${place.tag}</span>
              </div>
            </div>
          `)
        )
        .addTo(map.current);

      // On marker click: select destination and draw real-time route
      markerContainer.addEventListener("click", () => {
        setSelectedPlace(place);
        fetchAndDrawRoute(place);
      });

      markersRef.current.push(marker);
    });
  }, [places, activeFilter, selectedPlace, userLocation, fetchAndDrawRoute]);

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      gastronomia: "#2563EB",
      cultura: "#7B1FA2",
      naturaleza: "#16A34A",
      aventura: "#0097A7",
    };
    return colors[category] || "#1E293B";
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      gastronomia: "🍽️",
      cultura: "🎭",
      naturaleza: "🌿",
      aventura: "🧗",
    };
    return icons[category] || "📍";
  };

  // List of gastronomic places available with coordinates
  const gastroPlacesWithCoords = places
    .filter((p) => p.category === "gastronomia" && p.coordinates)
    .map((p) => ({
      ...p,
      distanceKm: p.coordinates ? calculateDistanceKm(userLocation, p.coordinates) : 0,
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <div className="relative min-h-screen bg-[#FAF7F2] font-sans overflow-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E2D9CC]">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-4 sm:px-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-subtitle font-bold text-[#37474F] hover:text-[#D81B60] transition cursor-pointer"
          >
            <span className="rotate-180 text-lg">→</span> Volver al inicio
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <span className="text-xl">🧭</span>
            <h1 className="font-subtitle text-base sm:text-lg font-bold text-[#37474F]">
              Mapa Interactivo & Navegación
            </h1>
          </div>

          <div className="w-32" />
        </div>
      </header>

      {/* Main Map View */}
      <div className="relative h-[calc(100vh-64px)] w-full">
        {/* Floating Category Filter Pills */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 flex-wrap justify-center px-4 max-w-[1240px]">
          {filterButtons.map((filter) => (
            <button
              key={filter.key}
              onClick={() => handleFilterClick(filter.key)}
              className={`px-4 py-2 rounded-full font-subtitle text-xs font-bold transition shadow-md cursor-pointer flex items-center gap-1.5 ${
                activeFilter === filter.key
                  ? "text-white scale-105"
                  : "bg-white/95 text-[#37474F] hover:bg-white border border-[#E2D9CC]"
              }`}
              style={
                activeFilter === filter.key
                  ? { backgroundColor: filter.color, boxShadow: `0 4px 14px ${filter.color}55` }
                  : undefined
              }
            >
              <span>{filter.icon}</span>
              <span>{filter.label}</span>
            </button>
          ))}
        </div>

        {/* GOOGLE MAPS STYLE NAVIGATION DRAWER (Shows when a place/route is active) */}
        {selectedPlace && (
          <div className="absolute bottom-5 left-4 right-4 sm:left-6 sm:right-auto sm:w-[440px] z-30 animate-in fade-in slide-in-from-bottom duration-300">
            <div className="rounded-3xl bg-white shadow-2xl border border-[#E2D9CC] overflow-hidden">
              {/* Header bar with Route info */}
              <div className="bg-[#1E293B] text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📍</span>
                    <div>
                      <p className="font-subtitle text-xs text-white/70 uppercase tracking-wider font-extrabold">
                        Ruta sugerida en tiempo real
                      </p>
                      <h3 className="font-subtitle text-base font-extrabold text-white truncate max-w-[260px]">
                        {selectedPlace.title}
                      </h3>
                    </div>
                  </div>

                  {/* Mode switcher (Driving / Walking) */}
                  <div className="flex items-center bg-white/10 rounded-full p-1 border border-white/20">
                    <button
                      onClick={() => {
                        setTravelMode("driving");
                        fetchAndDrawRoute(selectedPlace, "driving");
                      }}
                      className={`p-1.5 rounded-full text-xs transition cursor-pointer ${
                        travelMode === "driving"
                          ? "bg-[#2563EB] text-white shadow-sm"
                          : "text-white/70 hover:text-white"
                      }`}
                      title="En auto"
                    >
                      🚗
                    </button>
                    <button
                      onClick={() => {
                        setTravelMode("walking");
                        fetchAndDrawRoute(selectedPlace, "walking");
                      }}
                      className={`p-1.5 rounded-full text-xs transition cursor-pointer ${
                        travelMode === "walking"
                          ? "bg-[#2563EB] text-white shadow-sm"
                          : "text-white/70 hover:text-white"
                      }`}
                      title="A pie"
                    >
                      🚶
                    </button>
                  </div>
                </div>

                {/* Distance & Duration Badge */}
                {routeInfo && (
                  <div className="mt-3 flex items-center justify-between bg-white/10 rounded-2xl px-3.5 py-2 border border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="font-subtitle text-xl font-black text-[#60A5FA]">
                        ~{routeInfo.durationMin} min
                      </span>
                      <span className="text-xs text-white/80">({routeInfo.distanceKm} km)</span>
                    </div>
                    <span className="text-[11px] font-bold text-white/90">
                      {travelMode === "driving" ? "Ruta más rápida en coche" : "Ruta peatonal"}
                    </span>
                  </div>
                )}
              </div>

              {/* Destination Details & Quick Switcher */}
              <div className="p-4 bg-white space-y-3">
                <div className="flex items-start gap-3">
                  <img
                    src={selectedPlace.image}
                    alt={selectedPlace.title}
                    className="h-16 w-16 rounded-2xl object-cover shrink-0 border border-[#E2D9CC]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#6D4C41] font-medium truncate">
                      {selectedPlace.area}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="rounded-full bg-[#2563EB]/15 text-[#2563EB] px-2 py-0.5 text-[10px] font-bold">
                        {selectedPlace.tag}
                      </span>
                      <span className="text-xs font-bold text-[#37474F]">
                        ⭐ {selectedPlace.rating}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Switcher: Other Gastronomy options */}
                <div>
                  <p className="text-[11px] font-bold text-[#6D4C41] uppercase tracking-wider mb-2">
                    Cambiar a otro destino gastronómico:
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {gastroPlacesWithCoords.map((place) => (
                      <button
                        key={place.id}
                        onClick={() => {
                          setSelectedPlace(place);
                          fetchAndDrawRoute(place);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-subtitle font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
                          selectedPlace.id === place.id
                            ? "bg-[#2563EB] text-white shadow-md shadow-blue-600/30"
                            : "bg-[#FAF7F2] text-[#37474F] hover:bg-[#F0EBE1] border border-[#E2D9CC]"
                        }`}
                      >
                        <span>🍽️</span>
                        <span>{place.title.split("(")[0]}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          selectedPlace.id === place.id ? "bg-white/20 text-white" : "bg-[#E2D9CC] text-[#6D4C41]"
                        }`}>
                          {place.distanceKm} km
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#E8E3D8]">
                  <button
                    onClick={handleCenterRoute}
                    className="flex-1 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-2.5 text-xs font-subtitle font-bold shadow-md shadow-blue-600/25 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>🧭</span> Centrar Trayecto en el Mapa
                  </button>

                  <button
                    onClick={clearRoute}
                    className="rounded-xl bg-[#FAF7F2] hover:bg-red-50 text-red-600 border border-[#E2D9CC] px-3.5 py-2.5 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                    title="Cerrar ruta"
                  >
                    <span>✕</span> Limpiar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Container Element */}
        <div ref={mapContainer} className="h-full w-full" />
      </div>
    </div>
  );
}

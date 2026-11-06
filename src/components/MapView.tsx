import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PlaceItem } from "../types/auth";

type FilterType = "todos" | "gastronomia" | "cultura" | "naturaleza" | "aventura";
type TravelMode = "driving" | "walking";

interface MapViewProps {
  places: PlaceItem[];
  onBack: () => void;
  initialPlace?: PlaceItem | null;
}

// Cochabamba Coordinates: Plaza 14 de Septiembre [lat, lng]
const DEFAULT_COCHABAMBA_LATLNG: [number, number] = [-17.3935, -66.1568];

const filterButtons: { key: FilterType; label: string; color: string; icon: string }[] = [
  { key: "todos", label: "Todos", color: "#0F172A", icon: "🗺️" },
  { key: "gastronomia", label: "Gastronomía", color: "#BE123C", icon: "🍽️" },
  { key: "cultura", label: "Cultura", color: "#7C3AED", icon: "🎭" },
  { key: "naturaleza", label: "Naturaleza", color: "#059669", icon: "🌿" },
  { key: "aventura", label: "Aventura", color: "#0284C7", icon: "🧗" },
];

function calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

export function MapView({ places, onBack, initialPlace }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userAccuracyCircleRef = useRef<L.Circle | null>(null);

  const [activeFilter, setActiveFilter] = useState<FilterType>("todos");
  const [userLatLng, setUserLatLng] = useState<[number, number]>(DEFAULT_COCHABAMBA_LATLNG);
  const [isLiveGps, setIsLiveGps] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceItem | null>(initialPlace || null);
  const [travelMode, setTravelMode] = useState<TravelMode>("driving");
  const [routeInfo, setRouteInfo] = useState<{
    distanceKm: number;
    durationMin: number;
    isFallback?: boolean;
  } | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // 1. Geolocation tracker
  useEffect(() => {
    if (!navigator.geolocation) return;

    const onSuccess = (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setUserLatLng([lat, lng]);
      setIsLiveGps(true);

      // Update user marker if map is active
      if (mapRef.current) {
        if (!userMarkerRef.current) {
          const userIcon = L.divIcon({
            className: "custom-user-gps-marker",
            html: `
              <div style="position: relative; width: 22px; height: 22px;">
                <div style="position: absolute; inset: -6px; border-radius: 50%; background: rgba(37, 99, 235, 0.25); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                <div style="position: absolute; inset: 0; border-radius: 50%; background: #2563EB; border: 3px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></div>
              </div>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });

          userMarkerRef.current = L.marker([lat, lng], {
            icon: userIcon,
            zIndexOffset: 1000,
          }).addTo(mapRef.current);
          userMarkerRef.current.bindPopup(
            '<div style="font-family: inherit; font-size: 12px; font-weight: 700; color: #0F172A; text-align: center;">📍 Tu ubicación actual</div>'
          );
        } else {
          userMarkerRef.current.setLatLng([lat, lng]);
        }

        if (pos.coords.accuracy && pos.coords.accuracy < 1500) {
          if (!userAccuracyCircleRef.current) {
            userAccuracyCircleRef.current = L.circle([lat, lng], {
              radius: Math.min(pos.coords.accuracy, 250),
              color: "#3B82F6",
              weight: 1,
              fillColor: "#60A5FA",
              fillOpacity: 0.12,
            }).addTo(mapRef.current);
          } else {
            userAccuracyCircleRef.current.setLatLng([lat, lng]);
            userAccuracyCircleRef.current.setRadius(Math.min(pos.coords.accuracy, 250));
          }
        }
      }
    };

    const onError = (err: GeolocationPositionError) => {
      console.warn("GPS unavailable or permission denied, using default Cochabamba center:", err.message);
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 8000,
    });

    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      maximumAge: 12000,
      timeout: 10000,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // Prevent double initialization

    // Default center
    const center = userLatLng;

    const mapInstance = L.map(mapContainerRef.current, {
      center,
      zoom: 13,
      zoomControl: false,
      attributionControl: true,
    });

    // CartoDB Voyager tiles (100% free, high performance, elegant modern travel style)
    const voyagerTiles = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    );
    voyagerTiles.addTo(mapInstance);

    // Zoom controls in modern bottom-right position
    L.control.zoom({ position: "bottom-right" }).addTo(mapInstance);

    // Markers layer group
    const markersGroup = L.layerGroup().addTo(mapInstance);
    markersLayerRef.current = markersGroup;

    mapRef.current = mapInstance;

    // Trigger map container size invalidation once mounted
    setTimeout(() => {
      mapInstance.invalidateSize();
    }, 250);

    return () => {
      mapInstance.remove();
      mapRef.current = null;
    };
  }, []);

  // 3. Helper to get category visual tokens
  const getCategoryTheme = (category: string) => {
    switch (category) {
      case "gastronomia":
        return { color: "#BE123C", bg: "bg-rose-50 text-rose-800 border-rose-200", icon: "🍽️", label: "Gastronomía" };
      case "cultura":
        return { color: "#7C3AED", bg: "bg-purple-50 text-purple-800 border-purple-200", icon: "🎭", label: "Cultura" };
      case "naturaleza":
        return { color: "#059669", bg: "bg-emerald-50 text-emerald-800 border-emerald-200", icon: "🌿", label: "Naturaleza" };
      case "aventura":
        return { color: "#0284C7", bg: "bg-sky-50 text-sky-800 border-sky-200", icon: "🧗", label: "Aventura" };
      default:
        return { color: "#0F172A", bg: "bg-slate-100 text-slate-800 border-slate-200", icon: "📍", label: "Destino" };
    }
  };

  // 4. Fetch & Draw Route between User and Destination
  const fetchAndDrawRoute = useCallback(
    async (destination: PlaceItem, mode: TravelMode = travelMode) => {
      if (!destination.coordinates || !mapRef.current) return;

      setIsLoadingRoute(true);

      const [destLng, destLat] = destination.coordinates;
      const [userLat, userLng] = userLatLng;

      // Clean existing route polyline
      if (routeLayerRef.current) {
        routeLayerRef.current.remove();
        routeLayerRef.current = null;
      }

      // Try free OSRM Routing API (works without any secret tokens)
      const osrmProfile = mode === "walking" ? "foot" : "car";
      const osrmUrl = `https://router.project-osrm.org/route/v1/${osrmProfile}/${userLng},${userLat};${destLng},${destLat}?overview=full&geometries=geojson`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(osrmUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error("OSRM service status not OK");
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
          const durationMin = Math.max(1, Math.round(route.duration / 60));

          setRouteInfo({ distanceKm, durationMin, isFallback: false });

          // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
          const latLngs: [number, number][] = route.geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]]
          );

          // Draw sleek polyline with border casing
          const polyline = L.polyline(latLngs, {
            color: mode === "walking" ? "#059669" : "#2563EB",
            weight: 5.5,
            opacity: 0.88,
            lineJoin: "round",
            lineCap: "round",
          });

          polyline.addTo(mapRef.current);
          routeLayerRef.current = polyline;

          mapRef.current.fitBounds(polyline.getBounds(), {
            padding: [70, 70],
            maxZoom: 16,
          });
          return;
        }
        throw new Error("No routes in response");
      } catch (err) {
        // Fallback: Geodesic straight line with real-world distance
        const straightDistance = calculateDistanceKm(userLat, userLng, destLat, destLng);
        const estDuration = Math.max(
          2,
          Math.round((straightDistance / (mode === "walking" ? 4.5 : 30)) * 60)
        );

        setRouteInfo({
          distanceKm: straightDistance,
          durationMin: estDuration,
          isFallback: true,
        });

        if (mapRef.current) {
          const latLngs: [number, number][] = [
            [userLat, userLng],
            [destLat, destLng],
          ];
          const fallbackPoly = L.polyline(latLngs, {
            color: "#2563EB",
            weight: 4,
            opacity: 0.75,
            dashArray: "8, 8",
            lineJoin: "round",
          });
          fallbackPoly.addTo(mapRef.current);
          routeLayerRef.current = fallbackPoly;

          mapRef.current.fitBounds(fallbackPoly.getBounds(), {
            padding: [70, 70],
            maxZoom: 16,
          });
        }
      } finally {
        setIsLoadingRoute(false);
      }
    },
    [userLatLng, travelMode]
  );

  // 5. Clear active route
  const clearRoute = useCallback(() => {
    setSelectedPlace(null);
    setRouteInfo(null);
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }
  }, []);

  // 6. Draw Place Markers whenever filter, places, or selectedPlace change
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const filteredPlaces =
      activeFilter === "todos"
        ? places
        : places.filter((p) => p.category === activeFilter);

    filteredPlaces.forEach((place) => {
      if (!place.coordinates) return;

      const [destLng, destLat] = place.coordinates;
      const isSelected = selectedPlace?.id === place.id;
      const theme = getCategoryTheme(place.category);
      const distFromUser = calculateDistanceKm(userLatLng[0], userLatLng[1], destLat, destLng);

      // Create modern divIcon marker
      const markerHtml = `
        <div style="position: relative; cursor: pointer; transition: transform 0.2s ease;">
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? "34px" : "28px"};
            height: ${isSelected ? "34px" : "28px"};
            background-color: ${theme.color};
            border: 2.5px solid #FFFFFF;
            border-radius: 50%;
            box-shadow: ${
              isSelected
                ? `0 0 0 4px ${theme.color}45, 0 8px 16px rgba(0,0,0,0.35)`
                : "0 3px 8px rgba(0,0,0,0.28)"
            };
            font-size: ${isSelected ? "14px" : "12px"};
            color: white;
            user-select: none;
          ">
            ${theme.icon}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-place-div-icon",
        html: markerHtml,
        iconSize: [isSelected ? 34 : 28, isSelected ? 34 : 28],
        iconAnchor: [isSelected ? 17 : 14, isSelected ? 17 : 14],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([destLat, destLng], { icon: customIcon });

      // Custom modern popup
      const popupHtml = `
        <div style="min-width: 220px; font-family: inherit; border-radius: 12px; overflow: hidden; padding: 2px;">
          <div style="position: relative; height: 100px; margin: -2px -2px 10px -2px; border-radius: 10px 10px 0 0; overflow: hidden; background: #0F172A;">
            <img src="${place.image}" alt="${place.title}" style="width: 100%; height: 100%; object-fit: cover;" />
            <span style="position: absolute; top: 8px; right: 8px; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(4px); color: #F8FAFC; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;">
              ⭐ ${place.rating}
            </span>
          </div>
          <div style="padding: 0 4px 6px 4px;">
            <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800; color: #0F172A; line-height: 1.2;">${place.title}</h4>
            <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748B;">📍 ${place.area}</p>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; border-top: 1px solid #E2E8F0; padding-top: 8px;">
              <span style="font-size: 11px; color: #2563EB; font-weight: 700;">A ${distFromUser} km</span>
              <span style="font-size: 10px; background: ${theme.color}; color: white; padding: 2px 7px; border-radius: 6px; font-weight: 700;">${place.tag}</span>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: false,
        className: "modern-leaflet-popup",
      });

      marker.on("click", () => {
        setSelectedPlace(place);
        fetchAndDrawRoute(place);
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [places, activeFilter, selectedPlace, userLatLng, fetchAndDrawRoute]);

  // 7. Initial place handling
  useEffect(() => {
    if (initialPlace && initialPlace.coordinates) {
      setSelectedPlace(initialPlace);
      fetchAndDrawRoute(initialPlace);
    }
  }, [initialPlace, fetchAndDrawRoute]);

  // 8. Handle filter click
  const handleFilterClick = (filter: FilterType) => {
    setActiveFilter(filter);

    if (filter === "gastronomia") {
      const gastroPlaces = places.filter(
        (p) => p.category === "gastronomia" && p.coordinates
      );
      if (gastroPlaces.length > 0) {
        let closest = gastroPlaces[0];
        let minDistance = Infinity;
        gastroPlaces.forEach((p) => {
          if (p.coordinates) {
            const dist = calculateDistanceKm(
              userLatLng[0],
              userLatLng[1],
              p.coordinates[1],
              p.coordinates[0]
            );
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
      clearRoute();
    }
  };

  // 9. Recenter on user
  const handleCenterUser = () => {
    if (mapRef.current) {
      mapRef.current.setView(userLatLng, 15, { animate: true });
    }
  };

  // 10. Recenter on active route
  const handleCenterRoute = () => {
    if (mapRef.current && routeLayerRef.current) {
      mapRef.current.fitBounds(routeLayerRef.current.getBounds(), {
        padding: [70, 70],
        maxZoom: 16,
      });
    }
  };

  // List of gastronomic destinations for quick switcher
  const gastroPlacesWithCoords = places
    .filter((p) => p.category === "gastronomia" && p.coordinates)
    .map((p) => ({
      ...p,
      distanceKm: p.coordinates
        ? calculateDistanceKm(userLatLng[0], userLatLng[1], p.coordinates[1], p.coordinates[0])
        : 0,
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  // Generate Google Maps external URL
  const googleMapsUrl = selectedPlace?.coordinates
    ? `https://www.google.com/maps/dir/?api=1&origin=${userLatLng[0]},${userLatLng[1]}&destination=${selectedPlace.coordinates[1]},${selectedPlace.coordinates[0]}&travelmode=${travelMode}`
    : null;

  return (
    <div className="relative min-h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Precision Aguayo hairline */}
      <div className="aguayo-strip h-1 w-full fixed top-0 left-0 z-50 shadow-xs" />

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-4 sm:px-8">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-subtitle font-bold text-slate-700 hover:text-rose-600 transition cursor-pointer"
          >
            <span className="rotate-180 text-lg">→</span>
            <span>Volver al inicio</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-lg">🧭</span>
            <h1 className="font-subtitle text-sm sm:text-base font-extrabold text-slate-900">
              Mapa Interactivo de Cochabamba
            </h1>
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                isLiveGps
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isLiveGps ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
              <span>{isLiveGps ? "GPS en tiempo real" : "Centro Cochabamba"}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleCenterUser}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-subtitle font-bold text-slate-700 transition shadow-xs cursor-pointer"
            title="Ubicar mi posición en el mapa"
          >
            <span>🎯</span>
            <span className="hidden sm:inline">Mi Ubicación</span>
          </button>
        </div>
      </header>

      {/* Map Content Area */}
      <div className="relative h-[calc(100vh-64px)] w-full">
        {/* Floating Category Filter Chips (Modern, non-infantile) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 flex-wrap justify-center px-4 max-w-[1240px]">
          {filterButtons.map((filter) => {
            const count =
              filter.key === "todos"
                ? places.filter((p) => p.coordinates).length
                : places.filter((p) => p.category === filter.key && p.coordinates).length;

            const isActive = activeFilter === filter.key;

            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => handleFilterClick(filter.key)}
                className={`px-3.5 py-2 rounded-lg font-subtitle text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 border ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : "bg-white/95 text-slate-700 hover:bg-white hover:text-slate-900 border-slate-200"
                }`}
              >
                <span>{filter.icon}</span>
                <span>{filter.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* NAVIGATION BOTTOM DRAWER / ROUTE CARD (Clean, modern architectural design) */}
        {selectedPlace && (
          <div className="absolute bottom-5 left-4 right-4 sm:left-6 sm:right-auto sm:w-[440px] z-30 animate-in fade-in slide-in-from-bottom duration-300">
            <div className="rounded-xl bg-white shadow-2xl border border-slate-200/90 overflow-hidden">
              {/* Header bar with Route info */}
              <div className="bg-slate-900 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl shrink-0">📍</span>
                    <div className="min-w-0">
                      <p className="font-subtitle text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">
                        Ruta sugerida hacia
                      </p>
                      <h3 className="font-subtitle text-base font-extrabold text-white truncate max-w-[240px]">
                        {selectedPlace.title}
                      </h3>
                    </div>
                  </div>

                  {/* Mode switcher (Driving / Walking) */}
                  <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setTravelMode("driving");
                        fetchAndDrawRoute(selectedPlace, "driving");
                      }}
                      className={`px-2 py-1 rounded-md text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        travelMode === "driving"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-400 hover:text-white"
                      }`}
                      title="En auto"
                    >
                      <span>🚗</span>
                      <span className="hidden sm:inline text-[11px]">Auto</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTravelMode("walking");
                        fetchAndDrawRoute(selectedPlace, "walking");
                      }}
                      className={`px-2 py-1 rounded-md text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        travelMode === "walking"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-400 hover:text-white"
                      }`}
                      title="A pie"
                    >
                      <span>🚶</span>
                      <span className="hidden sm:inline text-[11px]">A pie</span>
                    </button>
                  </div>
                </div>

                {/* Distance & Duration Badge */}
                {isLoadingRoute ? (
                  <div className="mt-3 flex items-center gap-2 bg-slate-800/80 rounded-lg px-3.5 py-2 text-xs text-slate-300">
                    <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Calculando la ruta óptima en el mapa...</span>
                  </div>
                ) : routeInfo ? (
                  <div className="mt-3 flex items-center justify-between bg-slate-800/90 rounded-lg px-3.5 py-2 border border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="font-subtitle text-lg font-black text-sky-400">
                        ~{routeInfo.durationMin} min
                      </span>
                      <span className="text-xs text-slate-300 font-semibold">({routeInfo.distanceKm} km)</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-300">
                      {travelMode === "driving" ? "Ruta vial en vehículo" : "Ruta peatonal"}
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Destination Details */}
              <div className="p-4 bg-white space-y-3">
                <div className="flex items-start gap-3">
                  <img
                    src={selectedPlace.image}
                    alt={selectedPlace.title}
                    className="h-16 w-16 rounded-lg object-cover shrink-0 border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 font-medium truncate">
                      {selectedPlace.area}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-bold border border-slate-200">
                        {selectedPlace.tag}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        ⭐ {selectedPlace.rating}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Switcher: Other Gastronomy options (if gastronomy) */}
                {selectedPlace.category === "gastronomia" && gastroPlacesWithCoords.length > 1 && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Otros destinos gastronómicos:
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                      {gastroPlacesWithCoords.map((place) => (
                        <button
                          key={place.id}
                          type="button"
                          onClick={() => {
                            setSelectedPlace(place);
                            fetchAndDrawRoute(place);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-subtitle font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                            selectedPlace.id === place.id
                              ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                              : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                          }`}
                        >
                          <span>🍽️</span>
                          <span>{place.title.split("(")[0]}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                              selectedPlace.id === place.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {place.distanceKm} km
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCenterRoute}
                    className="flex-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white py-2.5 text-xs font-subtitle font-bold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>🧭</span>
                    <span>Centrar Trayecto</span>
                  </button>

                  {googleMapsUrl && (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-2.5 text-xs font-subtitle font-bold transition flex items-center gap-1"
                      title="Abrir en Google Maps para navegación por voz"
                    >
                      <span>🗺️</span>
                      <span className="hidden sm:inline">Google Maps</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={clearRoute}
                    className="rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 px-3 py-2.5 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                    title="Cerrar ruta"
                  >
                    <span>✕</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Container Element */}
        <div ref={mapContainerRef} className="h-full w-full z-0" />
      </div>
    </div>
  );
}

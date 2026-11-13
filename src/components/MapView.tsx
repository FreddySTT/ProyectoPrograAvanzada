import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { PlaceItem } from "../types/auth";
import { MAPBOX_TOKEN } from "../config/mapbox";

type FilterType = "todos" | "gastronomia" | "cultura" | "naturaleza" | "aventura";
type TravelMode = "driving" | "walking";

interface MapViewProps {
  places: PlaceItem[];
  onBack: () => void;
  initialPlace?: PlaceItem | null;
}

interface UserLocation {
  lng: number;
  lat: number;
}

// Cochabamba Coordinates: Plaza 14 de Septiembre [lng, lat]
const DEFAULT_COCHABAMBA: [number, number] = [-66.1568, -17.3935];

mapboxgl.accessToken = MAPBOX_TOKEN;

const filterButtons: { key: FilterType; label: string; color: string }[] = [
  { key: "todos", label: "Todos", color: "#0F172A" },
  { key: "gastronomia", label: "Gastronomía", color: "#BE123C" },
  { key: "cultura", label: "Cultura", color: "#7C3AED" },
  { key: "naturaleza", label: "Naturaleza", color: "#059669" },
  { key: "aventura", label: "Aventura", color: "#0284C7" },
];

// SVG icons (stroke currentColor) — same paths as the project's Icon component
const CATEGORY_ICON_SVG: Record<string, string> = {
  gastronomia:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 2v20"/><path d="M6 2v20"/><path d="M6 6h4"/></svg>',
  cultura:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><path d="m12 2.7 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.3l6.2-.9L12 2.7Z"/></svg>',
  naturaleza:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><path d="m8 3 4 8 5-5 5 11H2L8 3z"/></svg>',
  aventura:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><circle cx="5" cy="19" r="2"/><circle cx="19" cy="5" r="2"/><path d="M7 19h3a3 3 0 0 0 3-3V8a3 3 0 0 1 3-3h1"/></svg>',
  default:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
};

const categoryIconSvg = (category: string) =>
  CATEGORY_ICON_SVG[category] ?? CATEGORY_ICON_SVG.default;

// ─── Voice guidance (Web Speech API, Spanish) ──────────────────────────────
const speakEs = (text: string) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  // No cancel(): utterances queue so the greeting finishes before instructions
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-BO";
  utterance.rate = 1;
  // Pick a Spanish voice when available (voices load async — getVoices() warms the list)
  const voices = synth.getVoices();
  const esVoice =
    voices.find((v) => v.lang.toLowerCase().startsWith("es")) ??
    voices.find((v) => v.lang.toLowerCase().includes("es"));
  if (esVoice) utterance.voice = esVoice;
  synth.speak(utterance);
};

const stopSpeaking = () => {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

const getCategoryTheme = (category: string) => {
  switch (category) {
    case "gastronomia":
      return { color: "#BE123C", label: "Gastronomía" };
    case "cultura":
      return { color: "#7C3AED", label: "Cultura" };
    case "naturaleza":
      return { color: "#059669", label: "Naturaleza" };
    case "aventura":
      return { color: "#0284C7", label: "Aventura" };
    default:
      return { color: "#0F172A", label: "Destino" };
  }
};

export function MapView({ places, onBack, initialPlace }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ marker: mapboxgl.Marker; el: HTMLElement; place: PlaceItem }[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const geolocateRef = useRef<mapboxgl.GeolocateControl | null>(null);
  const routeCoordsRef = useRef<[number, number][] | null>(null);
  const fetchRouteRef = useRef<
    ((destination: PlaceItem, mode?: TravelMode, origin?: UserLocation | null) => Promise<void>) | null
  >(null);
  const userLocRef = useRef<UserLocation | null>(null);

  // Turn-by-turn navigation data
  interface NavStep {
    dist: number; // meters along the route where this maneuver happens
    text: string;
    announced: boolean;
  }
  const navRef = useRef<{
    coords: [number, number][];
    cum: number[]; // cumulative meters along coords
    steps: NavStep[];
    arrived: boolean;
  } | null>(null);
  const [navInstruction, setNavInstruction] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<FilterType>("todos");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLiveGps, setIsLiveGps] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceItem | null>(initialPlace || null);
  const [travelMode, setTravelMode] = useState<TravelMode>("driving");
  const [routeInfo, setRouteInfo] = useState<{
    distanceKm: number;
    durationMin: number;
    isFallback?: boolean;
  } | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [hideSkeleton, setHideSkeleton] = useState(false);

  // ─── 1. Initialize Mapbox map ──────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: DEFAULT_COCHABAMBA,
      zoom: 12.4,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

    const geolocate = new mapboxgl.GeolocateControl({
      trackUserLocation: true,
      showUserLocation: true,
      showAccuracyCircle: true,
    });
    geolocateRef.current = geolocate;
    map.addControl(geolocate, "top-right");

    map.on("load", () => {
      ensureRouteLayers(map);
      map.resize();
      setMapReady(true);
      window.setTimeout(() => setHideSkeleton(true), 500);
      // Auto-start GPS tracking (real-time user location)
      try {
        geolocate.trigger();
      } catch {
        /* permission denied or unsupported — map still works centered */
      }
    });

    // Safety fallback: never trap the user behind the skeleton
    const readyTimeout = window.setTimeout(() => {
      setMapReady(true);
      setHideSkeleton(true);
    }, 10000);

    map.on("geolocate", (e: any) => {
      const { longitude, latitude } = e.coords;
      setUserLocation({ lng: longitude, lat: latitude });
      setIsLiveGps(true);
    });

    map.on("geolocateerror", () => setIsLiveGps(false));

    mapRef.current = map;

    return () => {
      window.clearTimeout(readyTimeout);
      markersRef.current.forEach((m) => m.marker.remove());
      markersRef.current = [];
      popupRef.current?.remove();
      stopSpeaking();
      map.remove();
      mapRef.current = null;
      geolocateRef.current = null;
    };
  }, []);

  // ─── 1b. Real-time user location (native Geolocation, independent of Mapbox) ──
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({ lng: pos.coords.longitude, lat: pos.coords.latitude });
        setIsLiveGps(true);
      },
      () => setIsLiveGps(false),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // ─── 2. Route layers helper ───────────────────────────────────────────────
  const ensureRouteLayers = (map: mapboxgl.Map) => {
    if (!map.isStyleLoaded() || map.getSource("route")) return;

    // Insert route layers BELOW text labels but ABOVE roads/geometry.
    // The first "symbol" layer in streets-v12 is an arrow icon, not a label —
    // so we target the first symbol layer that actually renders text.
    const styleLayers = map.getStyle().layers ?? [];
    const labelLayer = styleLayers.find(
      (l) => l.type === "symbol" && (l.layout as any)?.["text-field"]
    );
    const fallbackSymbol = styleLayers.find((l) => l.type === "symbol");
    const beforeId = labelLayer?.id ?? fallbackSymbol?.id;

    map.addSource("route", {
      type: "geojson",
      data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } },
    });

    map.addLayer(
      {
        id: "route-casing",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#FFFFFF",
          "line-width": 6,
          "line-opacity": 0.9,
        },
      },
      beforeId
    );

    map.addLayer(
      {
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": ["get", "color"],
          "line-width": 3.5,
          "line-opacity": 0.9,
        },
      },
      beforeId
    );
  };

  // ─── 3. Marker element (created once, styled in place → no jumping) ───────
  // IMPORTANT: Mapbox positions the OUTER element via CSS transform. All visual
  // styles/hover go on the INNER circle so transforms never fight the map.
  const applyMarkerStyle = (el: HTMLElement, place: PlaceItem, isSelected: boolean) => {
    const theme = getCategoryTheme(place.category);
    const size = isSelected ? 36 : 30;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.backgroundColor = theme.color;
    el.style.boxShadow = isSelected
      ? `0 0 0 5px ${theme.color}45, 0 8px 18px rgba(0,0,0,.4)`
      : "0 3px 8px rgba(0,0,0,.3)";
    const svg = el.querySelector("svg");
    if (svg) {
      svg.setAttribute("width", isSelected ? "15" : "13");
      svg.setAttribute("height", isSelected ? "15" : "13");
    }
  };

  const buildMarkerElement = (place: PlaceItem): { outer: HTMLElement; inner: HTMLElement } => {
    const outer = document.createElement("div");
    outer.style.cssText = "cursor:pointer;user-select:none;";

    const inner = document.createElement("div");
    inner.style.cssText = `
      display:flex; align-items:center; justify-content:center;
      border:2.5px solid #FFFFFF; border-radius:50%; color:#fff;
      transition:transform .15s ease, width .15s ease, height .15s ease, box-shadow .15s ease;
    `;
    inner.innerHTML = categoryIconSvg(place.category);
    inner.addEventListener("mouseenter", () => (inner.style.transform = "scale(1.12)"));
    inner.addEventListener("mouseleave", () => (inner.style.transform = "scale(1)"));
    applyMarkerStyle(inner, place, false);

    outer.appendChild(inner);
    return { outer, inner };
  };

  // ─── 4. Popup builder ─────────────────────────────────────────────────────
  const openPlacePopup = (place: PlaceItem, map: mapboxgl.Map) => {
    popupRef.current?.remove();

    const [lng, lat] = place.coordinates!;
    const loc = userLocRef.current;
    const distKm = loc ? haversineKm(loc.lat, loc.lng, lat, lng) : null;

    const theme = getCategoryTheme(place.category);
    const el = document.createElement("div");
    el.style.cssText = "min-width:230px;font-family:inherit;border-radius:12px;overflow:hidden;";
    el.innerHTML = `
      <div style="position:relative;height:96px;background:#0F172A;">
        <img src="${place.image}" alt="${place.title}" style="width:100%;height:100%;object-fit:cover;display:block;" />
        <span style="position:absolute;top:8px;right:8px;background:rgba(15,23,42,.85);color:#F8FAFC;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;">${place.rating} ★</span>
      </div>
      <div style="padding:10px 12px 12px;background:#fff;">
        <h4 style="margin:0 0 4px;font-size:14px;font-weight:800;color:#0F172A;line-height:1.25;">${place.title}</h4>
        <p style="margin:0 0 8px;font-size:11px;color:#64748B;">${place.area}</p>
        <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid #E2E8F0;padding-top:8px;">
          <span style="font-size:11px;color:#2563EB;font-weight:700;">${distKm !== null ? `A ${distKm} km` : ""}</span>
          <span style="font-size:10px;background:${theme.color};color:#fff;padding:2px 7px;border-radius:6px;font-weight:700;">${place.tag || theme.label}</span>
        </div>
      </div>
    `;

    popupRef.current = new mapboxgl.Popup({ offset: 28, closeButton: false, maxWidth: "280px" })
      .setLngLat([lng, lat])
      .setDOMContent(el)
      .addTo(map);
  };

  // ─── 5. Fetch & draw route (Mapbox Directions API) ────────────────────────
  const fetchAndDrawRoute = useCallback(
    async (destination: PlaceItem, mode: TravelMode = travelMode, origin?: UserLocation | null) => {
      const map = mapRef.current;
      if (!map || !destination.coordinates) return;

      // If the style isn't ready yet, retry once it loads
      if (!map.isStyleLoaded()) {
        map.once("load", () => fetchAndDrawRoute(destination, mode, origin));
        return;
      }

      // Origin: explicit > GPS > map center (so a route always draws)
      const center = map.getCenter();
      const originLoc = origin ?? userLocation ?? { lng: center.lng, lat: center.lat };
      setSelectedPlace(destination);

      const [destLng, destLat] = destination.coordinates;
      const profile = mode === "walking" ? "walking" : "driving";
      const routeColor = mode === "walking" ? "#059669" : "#2563EB";

      setIsLoadingRoute(true);
      stopSpeaking(); // clear any stale queued utterances from a previous route
      ensureRouteLayers(map);

      const url =
        `https://api.mapbox.com/directions/v5/mapbox/${profile}/` +
        `${originLoc.lng},${originLoc.lat};${destLng},${destLat}` +
        `?geometries=geojson&overview=full&steps=true&language=es&access_token=${MAPBOX_TOKEN}`;

      const paintRoute = (coords: [number, number][], distanceKm: number, durationMin: number, isFallback = false) => {
        const source = map.getSource("route") as mapboxgl.GeoJSONSource | undefined;
        if (source) {
          source.setData({
            type: "Feature",
            properties: { color: routeColor },
            geometry: { type: "LineString", coordinates: coords },
          });
        }
        routeCoordsRef.current = coords;
        setRouteInfo({ distanceKm, durationMin, isFallback });

        const lons = coords.map((c) => c[0]);
        const lats = coords.map((c) => c[1]);
        map.fitBounds(
          [
            [Math.min(...lons), Math.min(...lats)],
            [Math.max(...lons), Math.max(...lats)],
          ],
          { padding: { top: 90, bottom: 220, left: 60, right: 60 }, maxZoom: 16, duration: 1200 }
        );
      };

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Directions ${res.status}`);
        const data = await res.json();
        const route = data.routes?.[0];
        if (!route) throw new Error("No route");

        const coords: [number, number][] = route.geometry.coordinates;

        // ── Build turn-by-turn data (maneuver instructions along the route) ──
        const cum: number[] = [0];
        for (let i = 1; i < coords.length; i++) {
          cum.push(
            cum[i - 1] +
              haversineKm(coords[i - 1][1], coords[i - 1][0], coords[i][1], coords[i][0]) * 1000
          );
        }

        const stepsIn = (route.legs?.[0]?.steps ?? []) as any[];
        const navSteps: NavStep[] = stepsIn
          .map((s) => {
            const loc = s.maneuver?.location as [number, number] | undefined;
            let bestIdx = 0;
            let bestD = Infinity;
            if (loc) {
              coords.forEach((c, i) => {
                const d = Math.abs(c[0] - loc[0]) + Math.abs(c[1] - loc[1]);
                if (d < bestD) {
                  bestD = d;
                  bestIdx = i;
                }
              });
            }
            const text =
              s.maneuver?.instruction?.trim() ||
              (s.name ? `Continúa por ${s.name}` : "Continúa por la ruta");
            return { dist: cum[bestIdx] ?? 0, text, announced: false };
          })
          // Keep the depart step (dist 0) — it is the first "head out" instruction
          .filter((s, i) => i === 0 || s.dist > 0);

        navRef.current = { coords, cum, steps: navSteps, arrived: false };
        setNavInstruction(null);

        paintRoute(
          coords,
          Math.round((route.distance / 1000) * 10) / 10,
          Math.max(1, Math.round(route.duration / 60))
        );
      } catch {
        // Fallback: línea recta con distancia real (sin instrucciones de giro)
        navRef.current = null;
        setNavInstruction(null);
        const distKm = haversineKm(originLoc.lat, originLoc.lng, destLat, destLng);
        const estMin = Math.max(2, Math.round((distKm / (mode === "walking" ? 4.5 : 30)) * 60));
        paintRoute(
          [
            [originLoc.lng, originLoc.lat],
            [destLng, destLat],
          ],
          distKm,
          estMin,
          true
        );
      } finally {
        setIsLoadingRoute(false);
      }
    },
    [userLocation, travelMode]
  );

  // Keep latest callbacks/location in refs so marker click handlers never go stale
  fetchRouteRef.current = fetchAndDrawRoute;
  userLocRef.current = userLocation;

  // ─── 6. Markers (created once per filter/data; selection updates style only) ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.marker.remove());
    markersRef.current = [];

    const filtered =
      activeFilter === "todos" ? places : places.filter((p) => p.category === activeFilter);

    filtered.forEach((place) => {
      if (!place.coordinates) return;
      const [lng, lat] = place.coordinates;

      const { outer, inner } = buildMarkerElement(place);
      const marker = new mapboxgl.Marker({ element: outer, anchor: "center" })
        .setLngLat([lng, lat])
        .addTo(map);

      marker.getElement().addEventListener("click", () => {
        setSelectedPlace(place);
        openPlacePopup(place, map);
        fetchRouteRef.current?.(place);
      });

      markersRef.current.push({ marker, el: inner, place });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places, activeFilter]);

  // Update only the selected/unselected marker styles — no recreation, no jump
  useEffect(() => {
    markersRef.current.forEach(({ el, place }) => {
      applyMarkerStyle(el, place, selectedPlace?.id === place.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlace?.id]);

  // ─── 7. Initial place ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!initialPlace?.coordinates || !mapRef.current) return;
    setSelectedPlace(initialPlace);
    // Esperar a que el mapa esté listo para trazar
    const map = mapRef.current;
    const run = () => {
      openPlacePopup(initialPlace, map);
      fetchAndDrawRoute(initialPlace);
    };
    if (map.loaded()) run();
    else map.once("load", run);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPlace]);

  // ─── 8. Clear route ───────────────────────────────────────────────────────
  const clearRoute = useCallback(() => {
    setSelectedPlace(null);
    setRouteInfo(null);
    setNavigating(false);
    setNavInstruction(null);
    navRef.current = null;
    stopSpeaking();
    routeCoordsRef.current = null;
    popupRef.current?.remove();
    const map = mapRef.current;
    const source = map?.getSource("route") as mapboxgl.GeoJSONSource | undefined;
    source?.setData({
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: [] },
    });
  }, []);

  // ─── 9. Auto-route to NEAREST place on first real-time GPS fix ────────────
  const autoRoutedRef = useRef(false);
  useEffect(() => {
    const map = mapRef.current;
    if (!userLocation || autoRoutedRef.current || !map) return;
    autoRoutedRef.current = true;

    let nearest: PlaceItem | null = null;
    let minDist = Infinity;
    places.forEach((p) => {
      if (!p.coordinates) return;
      const [lng, lat] = p.coordinates;
      const d = haversineKm(userLocation.lat, userLocation.lng, lat, lng);
      if (d < minDist) {
        minDist = d;
        nearest = p;
      }
    });

    if (nearest) {
      setSelectedPlace(nearest);
      openPlacePopup(nearest, map);
      fetchRouteRef.current?.(nearest, travelMode, userLocation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  // ─── 10. Center on route ──────────────────────────────────────────────────
  const handleCenterRoute = () => {
    const map = mapRef.current;
    const coords = routeCoordsRef.current;
    if (!map || !coords || coords.length === 0) return;
    const lons = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);
    map.fitBounds(
      [
        [Math.min(...lons), Math.min(...lats)],
        [Math.max(...lons), Math.max(...lats)],
      ],
      { padding: { top: 90, bottom: 220, left: 60, right: 60 }, maxZoom: 16, duration: 1000 }
    );
  };

  // ─── Derived UI data ──────────────────────────────────────────────────────
  // ─── Keep user + destination framed while "navegando" ─────────────────────
  // Frames BOTH points on every GPS update so the full route stays visible
  // instead of zooming into the user and losing the trayecto off-screen.
  useEffect(() => {
    const map = mapRef.current;
    if (!navigating || !userLocation || !map || !selectedPlace?.coordinates) return;
    const [dlng, dlat] = selectedPlace.coordinates;
    const lons = [userLocation.lng, dlng];
    const lats = [userLocation.lat, dlat];
    map.fitBounds(
      [
        [Math.min(...lons), Math.min(...lats)],
        [Math.max(...lons), Math.max(...lats)],
      ],
      { padding: { top: 80, bottom: 230, left: 50, right: 50 }, maxZoom: 16, duration: 900 }
    );
  }, [userLocation, navigating, selectedPlace?.id]);

  // ─── Turn-by-turn voice guidance while navigating ─────────────────────────
  useEffect(() => {
    if (!navigating || !userLocation) {
      setNavInstruction(null);
      return;
    }
    const nav = navRef.current;
    if (!nav || nav.coords.length === 0) {
      setNavInstruction(selectedPlace ? `Dirígete a ${selectedPlace.title}` : null);
      return;
    }

    // Progress = distance along route of the coord closest to the user
    let bestIdx = 0;
    let bestD = Infinity;
    nav.coords.forEach((c, i) => {
      const d = haversineKm(userLocation.lat, userLocation.lng, c[1], c[0]);
      if (d < bestD) {
        bestD = d;
        bestIdx = i;
      }
    });
    const progress = nav.cum[bestIdx] ?? 0;

    // Announce upcoming maneuvers ~200 m ahead (Google-style: "En X metros, ...")
    // and mark passed ones so they never repeat.
    let next: NavStep | null = null;
    for (const step of nav.steps) {
      const remaining = step.dist - progress;
      if (!step.announced) {
        if (remaining <= 200 && remaining > -40) {
          const distText = remaining > 15 ? `En ${Math.round(remaining)} metros, ` : "";
          speakEs(`${distText}${step.text}`);
          step.announced = true;
        } else if (remaining <= -40) {
          step.announced = true; // passed without announcing (GPS jump)
        } else {
          next = step;
          break;
        }
      }
    }

    // Arrival announcement
    if (selectedPlace?.coordinates && !nav.arrived) {
      const [dlng, dlat] = selectedPlace.coordinates;
      if (haversineKm(userLocation.lat, userLocation.lng, dlat, dlng) < 0.06) {
        nav.arrived = true;
        speakEs("Has llegado a tu destino");
      }
    }

    if (next) {
      const remainingM = Math.max(0, Math.round(next.dist - progress));
      setNavInstruction(
        remainingM > 0 ? `En ${remainingM} m — ${next.text}` : next.text
      );
    } else {
      setNavInstruction(
        selectedPlace ? `Dirígete a ${selectedPlace.title}` : null
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, navigating, selectedPlace?.id]);

  return (
    <div className="relative min-h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Precision Aguayo hairline */}
      <div className="aguayo-strip h-1 w-full fixed top-0 left-0 z-50 shadow-xs" />

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200">
        <div className="relative mx-auto flex h-16 max-w-[1240px] items-center px-4 sm:px-8">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-subtitle font-bold text-slate-700 hover:text-rose-600 transition cursor-pointer"
          >
            <span className="rotate-180 text-lg">→</span>
            <span>Volver al inicio</span>
          </button>

          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 pointer-events-none">
            <h1 className="font-subtitle text-sm sm:text-base font-extrabold text-slate-900">
              Mapa Interactivo de Cochabamba
            </h1>
          </div>
        </div>
      </header>

      {/* Map Content Area */}
      <div className="relative h-[calc(100vh-64px)] w-full">
        {/* Skeleton shimmer while the map style/tiles load */}
        {!hideSkeleton && (
          <div
            className={`absolute inset-0 z-10 bg-slate-100 overflow-hidden ${mapReady ? "map-skeleton-fade" : ""}`}
            aria-hidden="true"
          >
            {/* Fake filter pills row */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 flex gap-2">
              {[64, 92, 88, 96, 84].map((w, i) => (
                <div key={i} className="map-skeleton-shimmer h-9 rounded-full" style={{ width: w }} />
              ))}
            </div>

            {/* Fake place markers scattered like real POIs */}
            {[
              { top: "34%", left: "30%", size: 34 },
              { top: "46%", left: "52%", size: 30 },
              { top: "58%", left: "38%", size: 34 },
              { top: "40%", left: "66%", size: 30 },
              { top: "62%", left: "60%", size: 30 },
              { top: "30%", left: "44%", size: 26 },
              { top: "52%", left: "24%", size: 26 },
            ].map((m, i) => (
              <div
                key={i}
                className="map-skeleton-shimmer absolute rounded-full border-[3px] border-white shadow-md"
                style={{ top: m.top, left: m.left, width: m.size, height: m.size }}
              />
            ))}

            {/* Fake route card bottom-left */}
            <div className="absolute bottom-6 left-6 w-[320px] rounded-xl bg-white shadow-xl border border-slate-200 overflow-hidden">
              <div className="map-skeleton-shimmer h-20 w-full" />
              <div className="p-4 space-y-2.5">
                <div className="map-skeleton-shimmer h-3.5 w-2/3 rounded" />
                <div className="map-skeleton-shimmer h-3 w-1/2 rounded" />
                <div className="map-skeleton-shimmer h-9 w-full rounded-lg" />
              </div>
            </div>

            {/* Loading label */}
            <div className="absolute bottom-6 right-6 flex items-center gap-2 rounded-full bg-slate-900/85 px-4 py-2 text-xs font-subtitle font-bold text-white shadow-lg">
              <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Cargando mapa de Cochabamba…</span>
            </div>
          </div>
        )}

        {/* Floating Category Filter Pills */}
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
                onClick={() => setActiveFilter(filter.key)}
                className={`px-4 py-2 rounded-full font-subtitle text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 border ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : "bg-white/95 text-slate-700 hover:bg-white hover:text-slate-900 border-slate-200"
                }`}
                style={isActive ? { backgroundColor: filter.color, borderColor: filter.color } : undefined}
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: isActive ? "#FFFFFF" : filter.color }}
                />
                <span>{filter.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isActive ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ROUTE CARD (bottom drawer) */}
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
                    <span>Calculando la ruta óptima...</span>
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
                {/* Next turn-by-turn instruction (only while navigating) */}
                {navigating && navInstruction && (
                  <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 px-3 py-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-600 text-white">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M12 2 4.5 20.5 12 17l7.5 3.5L12 2z"/><path d="M12 17v-5"/></svg>
                    </span>
                    <div className="min-w-0">
                      <p className="font-subtitle text-[9px] font-extrabold uppercase tracking-[0.16em] text-emerald-700">
                        Siguiente instrucción
                      </p>
                      <p className="font-subtitle text-xs font-bold text-slate-800 leading-snug">
                        {navInstruction}
                      </p>
                    </div>
                  </div>
                )}

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

                {/* Bottom Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      // Wake up speech synthesis inside the user gesture so voice works
                      speakEs(
                        `Navegación iniciada${selectedPlace ? ` hacia ${selectedPlace.title}` : ""}`
                      );
                      setNavigating(true);
                      handleCenterRoute();
                    }}
                    className={`flex-1 rounded-lg py-2.5 text-xs font-subtitle font-bold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      navigating
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M8 5.5v13l11-6.5-11-6.5z"/></svg>
                    <span>{navigating ? "Navegando…" : "Iniciar navegación"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={clearRoute}
                    className="rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 px-4 py-2.5 text-xs font-bold transition cursor-pointer"
                    title="Terminar navegación"
                  >
                    Salir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Container Element */}
        <div ref={containerRef} className="h-full w-full z-0" />
      </div>
    </div>
  );
}

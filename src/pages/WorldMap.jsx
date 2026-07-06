import { useState, useRef, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Mic, MicOff, Navigation, Crosshair, X, Loader2, Cloud } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const TILE_LAYERS = {
  dark: { url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", attribution: "&copy; OpenStreetMap &copy; CARTO", maxZoom: 19 },
  satellite: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", attribution: "&copy; Esri", maxZoom: 19 },
  street: { url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: "&copy; OpenStreetMap", maxZoom: 19 },
};

// Component to fly to location when target changes
function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lon], target.zoom || 13, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
}

// Voice search hook
function useVoiceSearch(onResult) {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);
  const supported = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const start = useCallback(() => {
    if (!supported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    recRef.current = rec;
    rec.onresult = (e) => {
      const txt = e.results[0][0].transcript;
      onResult(txt);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
    setListening(true);
  }, [supported, onResult]);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, start, stop, supported };
}

export default function WorldMap() {
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tileLayer, setTileLayer] = useState("dark");
  const [route, setRoute] = useState(null);
  const [weather, setWeather] = useState(null);
  const mapRef = useRef(null);

  // Geocode using Nominatim (free, no API key)
  const geocode = useCallback(async (query) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`, {
        headers: { "Accept-Language": "en" },
      });
      const data = await res.json();
      if (data.length === 0) {
        setError(`No results for "${query}"`);
        setPlaces([]);
      } else {
        const results = data.map(d => ({
          lat: parseFloat(d.lat),
          lon: parseFloat(d.lon),
          label: d.display_name,
        }));
        setPlaces(results);
        setTarget({ ...results[0], zoom: 13 });
        fetchWeather(results[0].lat, results[0].lon);
      }
    } catch (e) {
      setError("Search failed. Check connection.");
    }
    setLoading(false);
  }, []);

  // Fetch weather from Open-Meteo (free, no API key)
  const fetchWeather = useCallback(async (lat, lon) => {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code&timezone=auto`);
      const data = await res.json();
      setWeather(data.current);
    } catch {}
  }, []);

  // Search nearby places using Overpass API
  const searchNearby = useCallback(async (type) => {
    if (!target) {
      setError("Search a location first");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const radius = 2000;
      const query = `[out:json][timeout:25];(
        node["amenity"~"${type}"](around:${radius},${target.lat},${target.lon});
        way["amenity"~"${type}"](around:${radius},${target.lat},${target.lon});
      );out center 20;`;
      const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await res.json();
      const results = data.elements.map(el => ({
        lat: el.lat || el.center?.lat,
        lon: el.lon || el.center?.lon,
        label: el.tags?.name || type,
        type: el.tags?.amenity || type,
      })).filter(r => r.lat && r.lon);
      setPlaces(results);
    } catch (e) {
      setError("Nearby search failed.");
    }
    setLoading(false);
  }, [target]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) geocode(search.trim());
  };

  const handleVoiceResult = useCallback((txt) => {
    setSearch(txt);
    // Parse voice commands
    const lower = txt.toLowerCase();
    const navMatch = lower.match(/(?:take me to|navigate to|go to|find|search for|directions to)\s+(.+)/);
    if (navMatch) {
      geocode(navMatch[1].trim());
      return;
    }
    const nearbyMatch = lower.match(/(?:nearby|near me|find|nearest)\s+(.+)/);
    if (nearbyMatch) {
      const place = nearbyMatch[1].trim();
      const typeMap = { restaurant: "restaurant", "petrol": "fuel", "gas": "fuel", "charging": "charging_station", "ev": "charging_station", "parking": "parking", "hospital": "hospital", "atm": "atm", "cafe": "cafe", "hotel": "hotel" };
      const amenity = Object.keys(typeMap).find(k => place.includes(k));
      if (amenity) searchNearby(typeMap[amenity]);
      else geocode(place);
      return;
    }
    geocode(txt);
  }, [geocode, searchNearby]);

  const { listening, start: startVoice, stop: stopVoice, supported: voiceSupported } = useVoiceSearch(handleVoiceResult);

  const nearbyButtons = [
    { label: "Restaurants", type: "restaurant", icon: "🍽️" },
    { label: "Petrol", type: "fuel", icon: "⛽" },
    { label: "EV Charge", type: "charging_station", icon: "🔋" },
    { label: "Parking", type: "parking", icon: "🅿️" },
    { label: "Hospitals", type: "hospital", icon: "🏥" },
    { label: "ATM", type: "atm", icon: "💳" },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#050103" }}>
      {/* Top bar */}
      <div className="flex-shrink-0 px-4 py-3 flex items-center gap-3 flex-wrap" style={{ borderBottom: "1px solid rgba(200,16,46,0.15)" }}>
        <MapPin className="w-4 h-4 flex-shrink-0 text-white/70" />
        <span className="text-[10px] font-mono tracking-[0.3em] text-white/70">IRIS LIVE MAPS</span>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 min-w-[200px] max-w-md">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search address, city, or place..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none text-white"
              style={{ background: "rgba(20,4,4,0.8)", border: "1px solid rgba(200,16,46,0.2)" }}
            />
          </div>
          <button type="submit" disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono text-white"
            style={{ background: "rgba(200,16,46,0.25)", border: "1px solid rgba(200,16,46,0.4)" }}>
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Crosshair className="w-3 h-3" />}
            SEARCH
          </button>
        </form>

        {/* Voice search */}
        <button
          onClick={listening ? stopVoice : startVoice}
          disabled={!voiceSupported}
          title={voiceSupported ? "Voice search" : "Voice not supported"}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono text-white"
          style={{
            background: listening ? "rgba(255,0,51,0.25)" : "rgba(200,16,46,0.12)",
            border: `1px solid ${listening ? "rgba(255,0,51,0.5)" : "rgba(200,16,46,0.2)"}`,
          }}
        >
          {listening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
          {listening ? "STOP" : "VOICE"}
        </button>

        {/* Tile layer switcher */}
        <div className="flex gap-1">
          {Object.keys(TILE_LAYERS).map(layer => (
            <button key={layer} onClick={() => setTileLayer(layer)}
              className="px-2 py-1 rounded text-[9px] font-mono text-white capitalize transition-all"
              style={{
                background: tileLayer === layer ? "rgba(200,16,46,0.25)" : "rgba(10,2,2,0.6)",
                border: `1px solid ${tileLayer === layer ? "rgba(200,16,46,0.4)" : "rgba(200,16,46,0.1)"}`,
              }}>
              {layer}
            </button>
          ))}
        </div>
      </div>

      {/* Nearby buttons */}
      <div className="flex-shrink-0 px-4 py-2 flex items-center gap-1.5 flex-wrap" style={{ background: "rgba(200,16,46,0.03)", borderBottom: "1px solid rgba(200,16,46,0.08)" }}>
        <span className="text-[9px] font-mono text-white/40 mr-1">FIND NEARBY:</span>
        {nearbyButtons.map(btn => (
          <button key={btn.type} onClick={() => searchNearby(btn.type)} disabled={loading || !target}
            className="px-2 py-1 rounded text-[9px] font-mono text-white disabled:opacity-30"
            style={{ background: "rgba(10,2,2,0.6)", border: "1px solid rgba(200,16,46,0.12)" }}>
            {btn.icon} {btn.label}
          </button>
        ))}
      </div>

      {/* Error / status */}
      {(error || listening) && (
        <div className="flex-shrink-0 px-4 py-1.5 flex items-center gap-2" style={{ background: "rgba(200,16,46,0.08)" }}>
          {listening ? (
            <>
              <Mic className="w-3 h-3 text-white animate-pulse" />
              <span className="text-[9px] font-mono text-white/70">Listening... speak a location or command</span>
            </>
          ) : (
            <>
              <X className="w-3 h-3 text-white/50" />
              <span className="text-[9px] font-mono text-white/60">{error}</span>
            </>
          )}
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative overflow-hidden">
        <MapContainer
          center={[20, 0]}
          zoom={3}
          className="w-full h-full"
          style={{ background: "#0a0202" }}
          ref={mapRef}
        >
          <TileLayer
            url={TILE_LAYERS[tileLayer].url}
            attribution={TILE_LAYERS[tileLayer].attribution}
            maxZoom={TILE_LAYERS[tileLayer].maxZoom}
          />
          <FlyTo target={target} />
          {target && (
            <Marker position={[target.lat, target.lon]}>
              <Popup>
                <div className="text-xs">
                  <p className="font-bold">{target.label?.split(",")[0] || "Location"}</p>
                  <p className="text-gray-600">{target.label}</p>
                </div>
              </Popup>
            </Marker>
          )}
          {places.map((place, i) => (
            <Marker key={i} position={[place.lat, place.lon]}>
              <Popup>
                <div className="text-xs">
                  <p className="font-bold">{place.label?.split(",")[0] || place.type}</p>
                  <p className="text-gray-600">{place.label}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Weather overlay */}
        {weather && target && (
          <div className="absolute top-3 left-3 z-[1000] rounded-xl p-3" style={{ background: "rgba(8,2,2,0.92)", border: "1px solid rgba(200,16,46,0.2)", backdropFilter: "blur(12px)" }}>
            <div className="flex items-center gap-2 mb-1">
              <Cloud className="w-4 h-4 text-white/70" />
              <span className="text-[9px] font-mono text-white/50">WEATHER</span>
            </div>
            <p className="text-lg font-bold text-white">{Math.round(weather.temperature_2m)}°C</p>
            <p className="text-[9px] font-mono text-white/50">Wind: {Math.round(weather.wind_speed_10m)} km/h</p>
          </div>
        )}

        {/* Places list overlay */}
        {places.length > 1 && (
          <div className="absolute top-3 right-3 z-[1000] w-56 max-h-[60%] overflow-y-auto rounded-xl p-2" style={{ background: "rgba(8,2,2,0.92)", border: "1px solid rgba(200,16,46,0.2)", backdropFilter: "blur(12px)" }}>
            <p className="text-[9px] font-mono text-white/50 mb-2 px-1">{places.length} PLACES FOUND</p>
            {places.map((place, i) => (
              <button key={i} onClick={() => setTarget({ ...place, zoom: 15 })}
                className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/5 mb-0.5">
                <p className="text-[10px] font-mono text-white/80 truncate">{place.label?.split(",")[0]}</p>
                <p className="text-[8px] font-mono text-white/40 truncate">{place.label}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
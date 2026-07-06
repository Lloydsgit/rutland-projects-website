import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Globe, Search, Navigation, Layers } from "lucide-react";
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const MAP_STYLES = [
  { label: "DARK OPS", url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png" },
  { label: "SATELLITE", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" },
  { label: "TERRAIN", url: "https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png" },
];

function FlyToLocation({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 14, { duration: 2 });
  }, [coords, map]);
  return null;
}

export default function MapWidget() {
  const [search, setSearch] = useState("");
  const [marker, setMarker] = useState(null);
  const [center, setCenter] = useState([20.5937, 78.9629]); // India center
  const [styleIdx, setStyleIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [popupText, setPopupText] = useState("");

  // Check for location intent from sessionStorage (set by JARVIS chat)
  useEffect(() => {
    const loc = sessionStorage.getItem("jarvis-map-location");
    if (loc) {
      sessionStorage.removeItem("jarvis-map-location");
      setSearch(loc);
      geocode(loc);
    }
  }, []);

  const geocode = async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const data = await res.json();
      if (data[0]) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setCenter([lat, lon]);
        setMarker([lat, lon]);
        setPopupText(data[0].display_name);
      }
    } catch { /* silent */ }
    setLoading(false);
  };

  const handleSearch = () => geocode(search);

  return (
    <div className="h-full flex flex-col">
      {/* Controls */}
      <div className="flex items-center gap-2 p-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(200,30,30,0.1)", background: "rgba(8,2,4,0.95)" }}>
        <Globe className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,80,80,0.5)" }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder="Search any location…"
          className="flex-1 bg-transparent text-sm font-mono text-foreground/80 placeholder:text-foreground/20 focus:outline-none"
        />
        <button onClick={handleSearch}
          className="px-3 py-1.5 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-all"
          style={{ background: "rgba(200,30,30,0.15)", border: "1px solid rgba(200,30,30,0.3)", color: "rgba(255,120,120,0.7)" }}>
          {loading ? <Navigation className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
          FLY TO
        </button>
        {/* Style toggle */}
        <div className="flex gap-1">
          {MAP_STYLES.map((s, i) => (
            <button key={i} onClick={() => setStyleIdx(i)}
              className="px-2 py-1 rounded text-[8px] font-mono transition-all"
              style={{
                background: styleIdx === i ? "rgba(200,30,30,0.2)" : "transparent",
                border: `1px solid ${styleIdx === i ? "rgba(200,30,30,0.35)" : "rgba(200,30,30,0.1)"}`,
                color: styleIdx === i ? "rgba(255,140,140,0.8)" : "rgba(180,80,80,0.35)",
              }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={center}
          zoom={5}
          style={{ width: "100%", height: "100%", background: "#080204" }}
          zoomControl={false}
        >
          <TileLayer
            key={styleIdx}
            url={MAP_STYLES[styleIdx].url}
            attribution=""
            maxZoom={19}
          />
          {marker && (
            <Marker position={marker}>
              <Popup>
                <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#ff5050", background: "#080204", padding: "4px" }}>
                  {popupText || "Target Location"}
                </div>
              </Popup>
            </Marker>
          )}
          <FlyToLocation coords={marker} />
        </MapContainer>

        {/* HUD overlay */}
        <div className="absolute top-3 left-3 pointer-events-none" style={{ zIndex: 1000 }}>
          <div className="text-[8px] font-mono tracking-widest" style={{ color: "rgba(255,80,80,0.4)" }}>
            JARVIS GEO-INTELLIGENCE
          </div>
        </div>
        <div className="absolute bottom-3 right-3 pointer-events-none" style={{ zIndex: 1000 }}>
          {marker && (
            <div className="text-[8px] font-mono" style={{ color: "rgba(255,80,80,0.4)", background: "rgba(8,2,4,0.8)", padding: "3px 6px", borderRadius: "4px" }}>
              {marker[0].toFixed(4)}, {marker[1].toFixed(4)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Navigation, Loader2, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import nepalDataRaw from "@/data/nepal-locations.json";

// Custom Premium Marker
const customIcon = L.divIcon({
  className: "custom-div-icon",
  html: `
    <div style="
      background-color: hsl(28, 55%, 42%);
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 10px 20px rgba(0,0,0,0.3);
    ">
      <div style="
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

L.Marker.prototype.options.icon = customIcon;


// --- Constants & Types ---

const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY || "pk.YOUR_LOCATIONIQ_TOKEN";
const DEFAULT_CENTER: [number, number] = [27.7172, 85.3240]; // Kathmandu

interface Municipality {
  name: string;
}

interface District {
  name: string;
  municipalities: string[];
  lat?: number;
  lng?: number;
}

interface Province {
  province: string;
  districts: District[];
}

const nepalData = nepalDataRaw as Province[];

interface LocationPickerProps {
  initialData?: {
    province?: string;
    district?: string;
    municipality?: string;
    ward?: string;
    lat?: number;
    lng?: number;
  };
  onChange: (data: any) => void;
}

// --- Helper Components ---

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function LocationMarker({ position, setPosition }: { position: [number, number]; setPosition: (pos: [number, number]) => void }) {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  const markerRef = useRef<L.Marker>(null);
  const eventHandlers = useCallback(() => ({
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const latlng = marker.getLatLng();
        setPosition([latlng.lat, latlng.lng]);
      }
    },
  }), [setPosition]);

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers()}
      position={position}
      ref={markerRef}
    >
    </Marker>
  );
}

// --- Main Component ---

export default function LocationPicker({ initialData, onChange }: LocationPickerProps) {
  const [province, setProvince] = useState(initialData?.province || "");
  const [district, setDistrict] = useState(initialData?.district || "");
  const [municipality, setMunicipality] = useState(initialData?.municipality || "");
  const [ward, setWard] = useState(initialData?.ward || "");
  const [position, setPosition] = useState<[number, number]>(
    initialData?.lat && initialData?.lng ? [initialData.lat, initialData.lng] : DEFAULT_CENTER
  );
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Filtered data for cascading selects
  const districts = nepalData.find((p) => p.province === province)?.districts || [];
  const municipalities = districts.find((d) => d.name === district)?.municipalities || [];

  // Sync with parent
  useEffect(() => {
    onChange({
      province,
      district,
      municipality,
      ward,
      lat: position[0],
      lng: position[1]
    });
  }, [province, district, municipality, ward, position]);

  // Handle cascading changes
  const handleProvinceChange = (val: string) => {
    setProvince(val);
    setDistrict("");
    setMunicipality("");
  };

  const handleDistrictChange = (val: string) => {
    setDistrict(val);
    setMunicipality("");
    const distData = districts.find(d => d.name === val);
    if (distData?.lat && distData?.lng) {
      setPosition([distData.lat, distData.lng]);
    }
  };

  // LocationIQ Search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(query + ", Nepal")}&format=json`
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setSearchResults(data);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setPosition([lat, lon]);
    setSearchQuery(result.display_name);
    setShowResults(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Province Select */}
        <div className="space-y-2">
          <label className="eyebrow text-[10px]">Province</label>
          <Select value={province} onValueChange={handleProvinceChange}>
            <SelectTrigger className="h-14 bg-secondary/30 border-border/50 focus:ring-accent/20">
              <SelectValue placeholder="Select Province" />
            </SelectTrigger>
            <SelectContent className="glass border-border/50">
              {nepalData.map((p) => (
                <SelectItem key={p.province} value={p.province} className="focus:bg-accent/10 focus:text-accent">
                  {p.province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* District Select */}
        <div className="space-y-2">
          <label className="eyebrow text-[10px]">District</label>
          <Select value={district} onValueChange={handleDistrictChange} disabled={!province}>
            <SelectTrigger className="h-14 bg-secondary/30 border-border/50 focus:ring-accent/20">
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent className="glass border-border/50">
              {districts.map((d) => (
                <SelectItem key={d.name} value={d.name}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Municipality Select */}
        <div className="space-y-2">
          <label className="eyebrow text-[10px]">Municipality / Rural Mun.</label>
          <Select value={municipality} onValueChange={setMunicipality} disabled={!district}>
            <SelectTrigger className="h-14 bg-secondary/30 border-border/50 focus:ring-accent/20">
              <SelectValue placeholder="Select Municipality" />
            </SelectTrigger>
            <SelectContent className="glass border-border/50 max-h-[300px]">
              {municipalities.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ward Input */}
        <div className="space-y-2">
          <label className="eyebrow text-[10px]">Ward No.</label>
          <Input
            type="number"
            placeholder="e.g. 1"
            value={ward}
            onChange={(e) => setWard(e.target.value)}
            className="h-14 bg-secondary/30 border-border/50 focus-visible:ring-accent/20"
          />
        </div>
      </div>

      {/* Map Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-accent animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Pin Exact Location</span>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : <Search className="h-4 w-4 text-muted-foreground" />}
            </div>
            <Input
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchQuery.length >= 3 && setShowResults(true)}
              placeholder="Search landmarks (e.g. Pashupatinath)"
              className="pl-10 h-10 bg-secondary/50 border-border/30 rounded-full text-xs"
            />
            {showResults && searchResults.length > 0 && (
              <div 
                data-lenis-prevent
                className="absolute z-[1001] top-full left-0 w-full mt-2 bg-background border border-border/50 rounded-xl shadow-lift max-h-[200px] overflow-y-auto touch-pan-y"
              >
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => selectSearchResult(res)}
                    className="w-full text-left px-4 py-3 text-[11px] text-foreground hover:bg-secondary transition-colors border-b border-border/10 last:border-0"
                  >
                    {res.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="relative group rounded-2xl overflow-hidden border border-border/50 shadow-soft h-[350px]">
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: "100%", width: "100%", filter: "grayscale(0.2) contrast(1.1)" }}
            className="z-10"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
            <MapUpdater center={position} zoom={13} />
          </MapContainer>
          
          {/* Map Overlay for aesthetic */}
          <div className="absolute inset-0 pointer-events-none border-[12px] border-background/20 z-20"></div>
          
          {/* Coordinates Display */}
          <div className="absolute bottom-4 left-4 z-[1000] glass px-4 py-2 rounded-full border border-border/50 flex items-center gap-3">
             <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-tighter text-muted-foreground font-bold">Latitude</span>
                <span className="text-[10px] font-mono">{position[0].toFixed(6)}</span>
             </div>
             <div className="w-px h-6 bg-border/50"></div>
             <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-tighter text-muted-foreground font-bold">Longitude</span>
                <span className="text-[10px] font-mono">{position[1].toFixed(6)}</span>
             </div>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground italic text-center">
          * Drag the pin to your exact doorstep for faster delivery.
        </p>
      </div>
    </div>
  );
}


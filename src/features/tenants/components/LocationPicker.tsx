import React, { useState, useEffect } from "react";
// @ts-ignore
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
// @ts-ignore
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, Navigation, LocateFixed } from "lucide-react";
import { toast } from "react-hot-toast";

// Fix Leaflet marker icon issue with Webpack/Vite
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

/**
 * Controller to handle map movement (FlyTo)
 */
const MapController = ({ position }: { position: L.LatLngExpression }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position as L.LatLngExpression, 16, {
        animate: true,
        duration: 1.5
      });
    }
  }, [position, map]);
  return null;
};

/**
 * Simplified Interactive Map Component centered in Costa Rica by default
 */
const LocationPicker: React.FC<LocationPickerProps> = ({ 
  initialLat, 
  initialLng, 
  onLocationSelect 
}) => {
  // Default to San José, Costa Rica if no coords provided
  const defaultLat = 9.9333;
  const defaultLng = -84.0833;

  const [position, setPosition] = useState<L.LatLngExpression>([
    initialLat || defaultLat, 
    initialLng || defaultLng
  ]);
  const [isLocating, setIsLocating] = useState(false);

  // Update internal state if props change (loading from DB)
  useEffect(() => {
    if (initialLat && initialLng) {
      setPosition([initialLat, initialLng]);
    }
  }, [initialLat, initialLng]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no soporta geolocalización");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPos: [number, number] = [latitude, longitude];
        setPosition(newPos);
        onLocationSelect(latitude, longitude);
        setIsLocating(false);
        toast.success("Ubicación detectada en Costa Rica");
      },
      (err) => {
        console.error(err);
        setIsLocating(false);
        toast.error("No se pudo obtener tu ubicación. Verifica los permisos.");
      },
      { enableHighAccuracy: true }
    );
  };

  // Map events to handle click and update marker
  const MapEvents = () => {
    useMapEvents({
      click(e: L.LeafletMouseEvent) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onLocationSelect(lat, lng);
      },
    });
    return null;
  };

  return (
    <div className="w-full space-y-4">
      {/* Map Container */}
      <div className="w-full h-96 rounded-3xl overflow-hidden border-4 border-gray-100 shadow-xl relative z-0">
        <MapContainer 
          center={position} 
          zoom={initialLat ? 16 : 8} // Zoom out if it's the default view
          scrollWheelZoom={true} 
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker 
            position={position} 
            draggable={true}
            eventHandlers={{
              dragend: (e: L.DragEndEvent) => {
                const marker = e.target;
                const newPos = marker.getLatLng();
                setPosition([newPos.lat, newPos.lng]);
                onLocationSelect(newPos.lat, newPos.lng);
              },
            }}
          />
          <MapController position={position} />
          <MapEvents />
        </MapContainer>
        
        {/* Floating Controls Overlay */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          <button
            type="button"
            onClick={handleLocateMe}
            title="Usar mi ubicación actual"
            className="w-12 h-12 bg-white text-blue-600 rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center hover:bg-blue-50 transition-all group active:scale-95"
            disabled={isLocating}
          >
            {isLocating ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <LocateFixed size={24} className="group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>

        <div className="absolute bottom-6 left-6 z-[1000] flex flex-col gap-2">
          <div className="bg-white/95 backdrop-blur px-4 py-2 rounded-2xl border shadow-lg flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <Navigation size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                  Costa Rica
              </p>
              <p className="text-xs font-semibold text-gray-700 mt-1">
                  Mueve el marcador o usa el GPS
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;

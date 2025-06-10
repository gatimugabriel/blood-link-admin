'use client';

import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

interface BloodRequestMapProps {
  latitude: number;
  longitude: number;
  facilityName: string;
}

export function BloodRequestMap({ latitude, longitude, facilityName }: BloodRequestMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // load Leaflet CSS and JS
    const loadLeaflet = async () => {
      // Load CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }

      // Load JS
      if (!(window as any).L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        script.onload = initMap;
        document.head.appendChild(script);
      } else {
        initMap();
      }
    };

    const initMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const L = (window as any).L;
      if (!L) return;

      // Initialize map
      const map = L.map(mapRef.current).setView([latitude, longitude], 15);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      const marker = L.marker([latitude, longitude]).addTo(map);
      marker.bindPopup(`<b>${facilityName}</b><br>${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);

      // Fit map to marker
      map.fitBounds(marker.getLatLng().toBounds(100));
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, facilityName]);

  const openInOpenStreetMap = () => {
    window.open(`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`, '_blank');
  };

  const openInDirections = () => {
    window.open(`https://www.openstreetmap.org/directions?from=&to=${latitude},${longitude}`, '_blank');
  };

  const openInGoogleMaps = () => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
  };

  return (
    <div className="relative h-full w-full">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="h-full w-full rounded-lg overflow-hidden border"
        style={{ minHeight: '256px' }}
      />
      
      {/* Map Controls Overlay */}
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={openInOpenStreetMap}
          className="h-8 px-2 text-xs bg-white/90 hover:bg-white shadow-sm"
        >
          <ExternalLink className="mr-1 h-3 w-3" />
          OSM
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={openInGoogleMaps}
          className="h-8 px-2 text-xs bg-white/90 hover:bg-white shadow-sm"
        >
          <ExternalLink className="mr-1 h-3 w-3" />
          Google
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={openInDirections}
          className="h-8 px-2 text-xs bg-white/90 hover:bg-white shadow-sm"
        >
          <Navigation className="mr-1 h-3 w-3" />
          Route
        </Button>
      </div>

      {/* Location Info Overlay */}
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm">
        <div className="text-xs">
          <div className="font-semibold text-gray-700">{facilityName}</div>
          <div className="text-gray-500 font-mono">
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </div>
        </div>
      </div>
    </div>
  );
} 
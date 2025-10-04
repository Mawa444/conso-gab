import { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapLibreViewProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  onMapLoad?: (map: maplibregl.Map) => void;
  onMoveEnd?: (bounds: maplibregl.LngLatBounds) => void;
  className?: string;
  children?: React.ReactNode;
}

export const MapLibreView = ({
  initialCenter = [9.4673, 0.4162], // Libreville, Gabon
  initialZoom = 12,
  onMapLoad,
  onMoveEnd,
  className = "",
  children
}: MapLibreViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialiser MapLibre avec tuiles OSM gratuites
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: initialCenter,
      zoom: initialZoom,
      minZoom: 2,
      maxZoom: 19,
    });

    // Ajouter contrôles de navigation
    map.current.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: false,
      }),
      "top-right"
    );

    // Ajouter contrôle de géolocalisation
    const geolocateControl = new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    });
    map.current.addControl(geolocateControl, "top-right");

    // Écouteur de chargement
    map.current.on("load", () => {
      setIsMapReady(true);
      if (onMapLoad && map.current) {
        onMapLoad(map.current);
      }
    });

    // Écouteur de mouvement
    if (onMoveEnd) {
      map.current.on("moveend", () => {
        if (map.current) {
          onMoveEnd(map.current.getBounds());
        }
      });
    }

    // Nettoyage
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mapContainer} className="absolute inset-0" />
      {isMapReady && children}
    </div>
  );
};

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { MapBusiness } from "@/hooks/use-map-businesses";
import { businessCategories } from "@/data/businessCategories";

interface BusinessMarkersLayerProps {
  map: maplibregl.Map | null;
  businesses: MapBusiness[];
  onBusinessClick?: (business: MapBusiness) => void;
}

export const BusinessMarkersLayer = ({
  map,
  businesses,
  onBusinessClick,
}: BusinessMarkersLayerProps) => {
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!map) return;

    // Supprimer les anciens markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Créer les nouveaux markers
    businesses.forEach((business) => {
      if (!business.latitude || !business.longitude) return;

      // Trouver l'icône de catégorie
      const category = businessCategories.find(
        (cat) => cat.id === business.business_category
      );
      const categoryIcon = category?.icon || "🏪";

      // Créer l'élément marker personnalisé
      const el = document.createElement("div");
      el.className = "business-marker";
      el.innerHTML = `
        <div class="relative cursor-pointer group">
          <div class="${
            business.is_verified
              ? "bg-primary text-primary-foreground"
              : "bg-muted-foreground text-white"
          } w-10 h-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-lg font-bold transition-all duration-200 hover:scale-125">
            ${categoryIcon}
          </div>
          ${
            business.is_verified
              ? '<div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>'
              : ""
          }
        </div>
      `;

      // Créer le marker
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([business.longitude, business.latitude])
        .addTo(map);

      // Créer popup
      const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: false,
      }).setHTML(`
        <div class="p-2 min-w-[200px]">
          <div class="flex items-start gap-2 mb-2">
            ${
              business.logo_url
                ? `<img src="${business.logo_url}" alt="${business.business_name}" class="w-10 h-10 rounded object-cover" />`
                : ""
            }
            <div class="flex-1">
              <h3 class="font-bold text-sm">${business.business_name}</h3>
              ${
                business.is_verified
                  ? '<span class="text-xs text-green-600">✓ Vérifié</span>'
                  : ""
              }
            </div>
          </div>
          ${
            business.description
              ? `<p class="text-xs text-muted-foreground mb-2">${business.description.substring(0, 100)}${business.description.length > 100 ? "..." : ""}</p>`
              : ""
          }
          ${
            business.address || business.city
              ? `<p class="text-xs text-muted-foreground mb-2">📍 ${business.address || ""} ${business.city || ""}</p>`
              : ""
          }
          <button 
            onclick="window.location.href='/business/${business.id}/profile'"
            class="w-full mt-2 px-3 py-1 bg-primary text-primary-foreground text-xs rounded hover:opacity-90 transition-opacity"
          >
            Voir le profil
          </button>
        </div>
      `);

      marker.setPopup(popup);

      // Gestion du clic
      if (onBusinessClick) {
        el.addEventListener("click", () => {
          onBusinessClick(business);
        });
      }

      markersRef.current.push(marker);
    });

    // Nettoyage
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [map, businesses, onBusinessClick]);

  return null;
};

import { MapPin, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GeographicFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

const geographicAreas = [
  { value: "all", label: "Tout le Gabon", level: "pays" },
  
  // Provinces
  { value: "estuaire", label: "Estuaire", level: "province" },
  { value: "haut-ogooue", label: "Haut-Ogooué", level: "province" },
  { value: "moyen-ogooue", label: "Moyen-Ogooué", level: "province" },
  { value: "ngounie", label: "Ngounié", level: "province" },
  { value: "nyanga", label: "Nyanga", level: "province" },
  { value: "ogooue-ivindo", label: "Ogooué-Ivindo", level: "province" },
  { value: "ogooue-lolo", label: "Ogooué-Lolo", level: "province" },
  { value: "ogooue-maritime", label: "Ogooué-Maritime", level: "province" },
  { value: "woleu-ntem", label: "Woleu-Ntem", level: "province" },
  
  // Villes principales
  { value: "libreville", label: "Libreville", level: "ville" },
  { value: "port-gentil", label: "Port-Gentil", level: "ville" },
  { value: "franceville", label: "Franceville", level: "ville" },
  { value: "oyem", label: "Oyem", level: "ville" },
  { value: "moanda", label: "Moanda", level: "ville" },
  { value: "lambarene", label: "Lambaréné", level: "ville" },
  { value: "tchibanga", label: "Tchibanga", level: "ville" },
  { value: "koulamoutou", label: "Koulamoutou", level: "ville" },
  { value: "makokou", label: "Makokou", level: "ville" },
  { value: "bitam", label: "Bitam", level: "ville" },
  
  // Arrondissements de Libreville
  { value: "libreville-1", label: "1er Arrdt (Centre)", level: "arrondissement" },
  { value: "libreville-2", label: "2ème Arrdt (Cocotiers)", level: "arrondissement" },
  { value: "libreville-3", label: "3ème Arrdt (Mont-Bouët)", level: "arrondissement" },
  { value: "libreville-4", label: "4ème Arrdt (Nombakélé)", level: "arrondissement" },
  { value: "libreville-5", label: "5ème Arrdt (Nzeng-Ayong)", level: "arrondissement" },
  { value: "libreville-6", label: "6ème Arrdt (Akanda)", level: "arrondissement" },
  
  // Quartiers populaires
  { value: "glass", label: "Glass", level: "quartier" },
  { value: "louis", label: "Louis", level: "quartier" },
  { value: "nombakele", label: "Nombakélé", level: "quartier" },
  { value: "akebe", label: "Akébé", level: "quartier" },
  { value: "oloumi", label: "Oloumi", level: "quartier" },
  { value: "soweto", label: "Soweto", level: "quartier" },
  { value: "pk5", label: "PK5", level: "quartier" },
  { value: "pk8", label: "PK8", level: "quartier" },
  { value: "pk12", label: "PK12", level: "quartier" },
  { value: "nzeng-ayong", label: "Nzeng-Ayong", level: "quartier" },
  { value: "Santa Clara", label: "Santa Clara", level: "quartier" },
  { value: "batterie4", label: "Batterie IV", level: "quartier" },
  { value: "cocotiers", label: "Cocotiers", level: "quartier" },
  { value: "chantiers", label: "Chantiers", level: "quartier" },
];

const levelColors = {
  pays: "text-primary",
  province: "text-accent",
  ville: "text-secondary",
  arrondissement: "text-blue-600",
  quartier: "text-green-600",
};

const levelIcons = {
  pays: "🇬🇦",
  province: "🏛️",
  ville: "🏙️",
  arrondissement: "🏘️",
  quartier: "🏠",
};

export const GeographicFilter = ({ value, onValueChange, className }: GeographicFilterProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <MapPin className="w-4 h-4 mr-2" />
        <SelectValue placeholder="Sélectionner une zone" />
      </SelectTrigger>
      <SelectContent className="max-h-80">
        {geographicAreas.map((area) => (
          <SelectItem 
            key={area.value} 
            value={area.value}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-2 w-full">
              <span className="text-sm">{levelIcons[area.level as keyof typeof levelIcons]}</span>
              <span className={`${levelColors[area.level as keyof typeof levelColors]} font-medium`}>
                {area.label}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                {area.level}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
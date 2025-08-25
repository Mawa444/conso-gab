import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Province {
  id: string;
  name: string;
  code: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  province_id: string;
}

interface Arrondissement {
  id: string;
  name: string;
  code: string;
  department_id: string;
}

interface Quartier {
  id: string;
  name: string;
  arrondissement_id: string;
}

// Données statiques pour le moment, en attendant la connexion Supabase
const STATIC_PROVINCES: Province[] = [
  { id: "1", name: "Estuaire", code: "EST" },
  { id: "2", name: "Haut-Ogooué", code: "HO" },
  { id: "3", name: "Moyen-Ogooué", code: "MO" },
  { id: "4", name: "Ngounié", code: "NG" },
  { id: "5", name: "Nyanga", code: "NY" },
  { id: "6", name: "Ogooué-Ivindo", code: "OI" },
  { id: "7", name: "Ogooué-Lolo", code: "OL" },
  { id: "8", name: "Ogooué-Maritime", code: "OM" },
  { id: "9", name: "Woleu-Ntem", code: "WN" }
];

const STATIC_DEPARTMENTS: Department[] = [
  { id: "1", name: "Libreville", code: "LBV", province_id: "1" },
  { id: "2", name: "Komo-Mondah", code: "KM", province_id: "1" },
  { id: "3", name: "Noya", code: "NY", province_id: "1" }
];

const STATIC_ARRONDISSEMENTS: Arrondissement[] = [
  { id: "1", name: "1er Arrondissement", code: "1ER", department_id: "1" },
  { id: "2", name: "2ème Arrondissement", code: "2EM", department_id: "1" },
  { id: "3", name: "3ème Arrondissement", code: "3EM", department_id: "1" },
  { id: "4", name: "4ème Arrondissement", code: "4EM", department_id: "1" },
  { id: "5", name: "5ème Arrondissement", code: "5EM", department_id: "1" },
  { id: "6", name: "6ème Arrondissement", code: "6EM", department_id: "1" }
];

const STATIC_QUARTIERS: Quartier[] = [
  { id: "1", name: "Glass", arrondissement_id: "1" },
  { id: "2", name: "Louis", arrondissement_id: "1" },
  { id: "3", name: "Cocotiers", arrondissement_id: "2" },
  { id: "4", name: "Chantiers", arrondissement_id: "2" },
  { id: "5", name: "Mont-Bouët", arrondissement_id: "3" },
  { id: "6", name: "Nombakélé", arrondissement_id: "4" },
  { id: "7", name: "Akébé", arrondissement_id: "4" },
  { id: "8", name: "Nzeng-Ayong", arrondissement_id: "5" },
  { id: "9", name: "PK5", arrondissement_id: "5" },
  { id: "10", name: "PK8", arrondissement_id: "5" },
  { id: "11", name: "Soweto", arrondissement_id: "6" },
  { id: "12", name: "Oloumi", arrondissement_id: "6" }
];

export const useProvinces = () => {
  return useQuery({
    queryKey: ["provinces"],
    queryFn: async () => {
      return STATIC_PROVINCES;
    },
  });
};

export const useDepartments = (provinceId?: string) => {
  return useQuery({
    queryKey: ["departments", provinceId],
    queryFn: async () => {
      if (!provinceId) return [];
      return STATIC_DEPARTMENTS.filter(dept => dept.province_id === provinceId);
    },
    enabled: !!provinceId,
  });
};

export const useArrondissements = (departmentId?: string) => {
  return useQuery({
    queryKey: ["arrondissements", departmentId],  
    queryFn: async () => {
      if (!departmentId) return [];
      return STATIC_ARRONDISSEMENTS.filter(arr => arr.department_id === departmentId);
    },
    enabled: !!departmentId,
  });
};

export const useQuartiers = (arrondissementId?: string) => {
  return useQuery({
    queryKey: ["quartiers", arrondissementId],
    queryFn: async () => {
      if (!arrondissementId) return [];
      return STATIC_QUARTIERS.filter(quartier => quartier.arrondissement_id === arrondissementId);
    },
    enabled: !!arrondissementId,
  });
};
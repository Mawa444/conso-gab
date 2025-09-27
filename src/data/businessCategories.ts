// Catégories business réelles correspondant aux enums de la base de données
export interface BusinessCategory {
  id: string;
  name: string;
  nom: string; // Alias pour compatibilité
  icon: string;
  color?: string; // Optionnel pour compatibilité
  subcategories?: any[]; // Optionnel pour compatibilité
  tags?: string[]; // Optionnel pour compatibilité
}

export const businessCategories: BusinessCategory[] = [
  { id: 'restaurant', name: 'Restaurant & Hôtellerie', nom: 'Restaurant & Hôtellerie', icon: '🍽️', color: 'from-orange-500 to-red-600' },
  { id: 'retail', name: 'Commerce & Distribution', nom: 'Commerce & Distribution', icon: '🛒', color: 'from-blue-500 to-indigo-600' },
  { id: 'services', name: 'Services de proximité', nom: 'Services de proximité', icon: '🔧', color: 'from-amber-500 to-orange-600' },
  { id: 'technology', name: 'Technologie & Numérique', nom: 'Technologie & Numérique', icon: '💻', color: 'from-cyan-500 to-blue-600' },
  { id: 'healthcare', name: 'Santé & Bien-être', nom: 'Santé & Bien-être', icon: '🏥', color: 'from-green-500 to-emerald-600' },
  { id: 'education', name: 'Éducation & Formation', nom: 'Éducation & Formation', icon: '📚', color: 'from-indigo-500 to-blue-600' },
  { id: 'finance', name: 'Finance & Banque', nom: 'Finance & Banque', icon: '🏦', color: 'from-emerald-500 to-teal-600' },
  { id: 'real_estate', name: 'Immobilier & BTP', nom: 'Immobilier & BTP', icon: '🏗️', color: 'from-gray-600 to-slate-700' },
  { id: 'automotive', name: 'Automobile & Transport', nom: 'Automobile & Transport', icon: '🚗', color: 'from-blue-600 to-indigo-700' },
  { id: 'beauty', name: 'Beauté & Coiffure', nom: 'Beauté & Coiffure', icon: '💄', color: 'from-pink-500 to-rose-600' },
  { id: 'fitness', name: 'Sport & Fitness', nom: 'Sport & Fitness', icon: '💪', color: 'from-green-600 to-lime-600' },
  { id: 'entertainment', name: 'Culture & Loisirs', nom: 'Culture & Loisirs', icon: '🎭', color: 'from-violet-500 to-purple-600' },
  { id: 'agriculture', name: 'Agriculture & Pêche', nom: 'Agriculture & Pêche', icon: '🌱', color: 'from-green-600 to-lime-600' },
  { id: 'manufacturing', name: 'Artisanat & Production', nom: 'Artisanat & Production', icon: '🔨', color: 'from-amber-500 to-orange-600' },
  { id: 'other', name: 'Autre', nom: 'Autre', icon: '📋', color: 'from-gray-500 to-slate-600' }
];

export const getAllBusinessCategories = () => businessCategories;
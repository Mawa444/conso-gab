import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { FileText, Star, Clock, ShoppingBag, HeadphonesIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: 'accueil' | 'vente' | 'support' | 'rappels' | 'custom';
  variables?: string[];
  favorite?: boolean;
  usageCount?: number;
}

interface MessageTemplatesProps {
  onTemplateSelect: (template: MessageTemplate) => void;
  className?: string;
}

export const MessageTemplates: React.FC<MessageTemplatesProps> = ({
  onTemplateSelect,
  className
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const templates: MessageTemplate[] = [
    {
      id: '1',
      name: 'Bienvenue',
      content: 'Bonjour {nom} ! 👋 Bienvenue sur MIMO Chat. Comment puis-je vous aider aujourd\'hui ?',
      category: 'accueil',
      variables: ['nom'],
      favorite: true,
      usageCount: 45
    },
    {
      id: '2',
      name: 'Confirmation commande',
      content: 'Merci pour votre commande #{numero} ! Votre commande de {produit} sera livrée le {date}. 📦',
      category: 'vente',
      variables: ['numero', 'produit', 'date'],
      usageCount: 32
    },
    {
      id: '3',
      name: 'Support technique',
      content: 'J\'ai bien reçu votre demande concernant {sujet}. Notre équipe technique vous contactera dans les 24h. 🔧',
      category: 'support',
      variables: ['sujet'],
      usageCount: 28
    },
    {
      id: '4',
      name: 'Rappel rendez-vous',
      content: 'Rappel : Vous avez un rendez-vous demain à {heure} concernant {sujet}. Confirmez-vous votre présence ? ⏰',
      category: 'rappels',
      variables: ['heure', 'sujet'],
      favorite: true,
      usageCount: 19
    },
    {
      id: '5',
      name: 'Promotion',
      content: '🎉 Offre spéciale ! {pourcentage}% de réduction sur {produit} jusqu\'au {date}. Code : {code}',
      category: 'vente',
      variables: ['pourcentage', 'produit', 'date', 'code'],
      usageCount: 67
    }
  ];

  const categories = [
    { id: 'all', name: 'Tous', icon: FileText },
    { id: 'accueil', name: 'Accueil', icon: Star },
    { id: 'vente', name: 'Vente', icon: ShoppingBag },
    { id: 'support', name: 'Support', icon: HeadphonesIcon },
    { id: 'rappels', name: 'Rappels', icon: Clock }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTemplateSelect = (template: MessageTemplate) => {
    onTemplateSelect(template);
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || FileText;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      accueil: 'bg-blue-100 text-blue-800',
      vente: 'bg-green-100 text-green-800',
      support: 'bg-orange-100 text-orange-800',
      rappels: 'bg-purple-100 text-purple-800',
      custom: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.custom;
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className={cn("p-2", className)}>
          <FileText className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader className="mb-4">
          <SheetTitle>Templates de Messages</SheetTitle>
        </SheetHeader>
        
        {/* Barre de recherche */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Rechercher un template..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-mimo-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        {/* Filtres par catégorie */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {categories.map(category => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <IconComponent className="w-4 h-4" />
                {category.name}
              </Button>
            );
          })}
        </div>
        
        {/* Liste des templates */}
        <div className="space-y-3 overflow-y-auto flex-1">
          {filteredTemplates.map(template => {
            const CategoryIcon = getCategoryIcon(template.category);
            
            return (
              <div
                key={template.id}
                className="p-4 border border-mimo-gray-200 rounded-lg hover:bg-mimo-gray-50 cursor-pointer transition-colors"
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-mimo-gray-900">
                      {template.name}
                    </h3>
                    {template.favorite && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={getCategoryColor(template.category)}
                    >
                      <CategoryIcon className="w-3 h-3 mr-1" />
                      {template.category}
                    </Badge>
                    
                    {template.usageCount !== undefined && (
                      <span className="text-xs text-mimo-gray-500">
                        {template.usageCount} utilisations
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-mimo-gray-600 mb-2 line-clamp-2">
                  {template.content}
                </p>
                
                {template.variables && template.variables.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs text-mimo-gray-500 mr-2">Variables :</span>
                    {template.variables.map(variable => (
                      <Badge 
                        key={variable} 
                        variant="outline" 
                        className="text-xs px-2 py-0"
                      >
                        {`{${variable}}`}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          
          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-mimo-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucun template trouvé</p>
              {searchQuery && (
                <p className="text-sm">pour "{searchQuery}"</p>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
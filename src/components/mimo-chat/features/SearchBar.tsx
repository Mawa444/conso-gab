import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'conversation' | 'message' | 'contact';
  title: string;
  subtitle?: string;
  avatar?: string;
  timestamp?: string;
  content?: string;
}

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onResultClick?: (result: SearchResult) => void;
  className?: string;
  autoFocus?: boolean;
  showSuggestions?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Rechercher une conversation, un contact...",
  onSearch,
  onResultClick,
  className,
  autoFocus = false,
  showSuggestions = true
}) => {
  const [query, setQuery] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions] = useState<string[]>([
    "Messages récents",
    "Photos partagées", 
    "Documents",
    "Liens"
  ]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Simuler une recherche
  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    // Simulation de résultats
    const mockResults: SearchResult[] = [
      {
        id: '1',
        type: 'conversation',
        title: 'Marie Dubois',
        subtitle: 'Dernière activité: il y a 2h',
        content: 'Salut ! Comment ça va ?'
      },
      {
        id: '2', 
        type: 'message',
        title: 'Dans: Équipe Marketing',
        subtitle: 'Hier à 14:30',
        content: `Message contenant "${searchQuery}"`
      }
    ];

    setResults(mockResults);
    onSearch?.(searchQuery);
  };

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        performSearch(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    performSearch(suggestion);
    
    // Ajouter aux recherches récentes
    setRecentSearches(prev => {
      const updated = [suggestion, ...prev.filter(s => s !== suggestion)];
      return updated.slice(0, 5);
    });
  };

  const renderSearchResult = (result: SearchResult) => {
    const getTypeIcon = () => {
      switch (result.type) {
        case 'conversation': return '👤';
        case 'message': return '💬'; 
        case 'contact': return '📞';
        default: return '🔍';
      }
    };

    return (
      <button
        key={result.id}
        onClick={() => onResultClick?.(result)}
        className="w-full p-3 hover:bg-mimo-gray-50 border-b border-mimo-gray-100 text-left transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{getTypeIcon()}</span>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-mimo-gray-900 truncate">
                {result.title}
              </h4>
              {result.timestamp && (
                <span className="text-xs text-mimo-gray-500">
                  {result.timestamp}
                </span>
              )}
            </div>
            
            {result.subtitle && (
              <p className="text-sm text-mimo-gray-600 truncate mb-1">
                {result.subtitle}
              </p>
            )}
            
            {result.content && (
              <p className="text-sm text-mimo-gray-500 truncate">
                {result.content}
              </p>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className={cn("relative", className)}>
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-mimo-gray-400" />
        
        <Input
          ref={inputRef}
          value={query}
          onChange={handleQueryChange}
          onFocus={() => setIsActive(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="pl-10 pr-10 bg-white border-mimo-gray-200 focus:border-primary-500 rounded-full"
        />
        
        {query && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Dropdown avec résultats */}
      {isActive && (
        <>
          {/* Overlay pour fermer */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsActive(false)}
          />
          
          {/* Résultats */}
          <div 
            ref={resultsRef}
            className="absolute top-full left-0 right-0 bg-white border border-mimo-gray-200 rounded-lg shadow-mimo-8 mt-1 max-h-96 overflow-y-auto z-20"
          >
            {query ? (
              // Résultats de recherche
              results.length > 0 ? (
                <div>
                  <div className="px-4 py-2 bg-mimo-gray-50 border-b border-mimo-gray-100">
                    <p className="text-sm font-medium text-mimo-gray-700">
                      Résultats pour "{query}"
                    </p>
                  </div>
                  {results.map(renderSearchResult)}
                </div>
              ) : (
                <div className="p-8 text-center text-mimo-gray-500">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Aucun résultat pour "{query}"</p>
                </div>
              )
            ) : showSuggestions ? (
              // Suggestions et recherches récentes
              <div>
                {recentSearches.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-mimo-gray-50 border-b border-mimo-gray-100">
                      <p className="text-sm font-medium text-mimo-gray-700 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Recherches récentes
                      </p>
                    </div>
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(search)}
                        className="w-full p-3 hover:bg-mimo-gray-50 text-left border-b border-mimo-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-mimo-gray-400" />
                          <span className="text-mimo-gray-700">{search}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                <div>
                  <div className="px-4 py-2 bg-mimo-gray-50 border-b border-mimo-gray-100">
                    <p className="text-sm font-medium text-mimo-gray-700 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Suggestions
                    </p>
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full p-3 hover:bg-mimo-gray-50 text-left border-b border-mimo-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-4 h-4 text-mimo-gray-400" />
                        <span className="text-mimo-gray-700">{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};
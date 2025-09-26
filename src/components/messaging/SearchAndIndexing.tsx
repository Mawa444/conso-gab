import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Filter, X, MessageSquare, Package, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchResult {
  id: string;
  type: 'conversation' | 'catalog' | 'message' | 'order';
  title: string;
  content: string;
  metadata?: any;
  created_at: string;
}

interface SearchAndIndexingProps {
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  filters?: Array<'conversation' | 'catalog' | 'message' | 'order'>;
}

export const SearchAndIndexing = ({ 
  onResultSelect, 
  placeholder = "Rechercher...",
  filters = ['conversation', 'catalog', 'message', 'order']
}: SearchAndIndexingProps) => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>(filters);
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.trim() && user) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery, activeFilters, user]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const results: SearchResult[] = [];

      // Search conversations
      if (activeFilters.includes('conversation')) {
        const { data: conversations } = await supabase
          .from('conversations')
          .select(`
            id, title, origin_type, created_at,
            participants!inner(user_id)
          `)
          .eq('participants.user_id', user!.id)
          .ilike('title', `%${searchQuery}%`);

        conversations?.forEach(conv => {
          results.push({
            id: conv.id,
            type: 'conversation',
            title: conv.title || `Conversation ${conv.origin_type}`,
            content: `Type: ${conv.origin_type}`,
            metadata: { origin_type: conv.origin_type },
            created_at: conv.created_at
          });
        });
      }

        // Search messages (simplified query)
        const { data: conversationIds } = await supabase
          .from('participants')
          .select('conversation_id')
          .eq('user_id', user!.id);

        if (conversationIds && conversationIds.length > 0) {
          const convIds = conversationIds.map(p => p.conversation_id);
          
          const { data: messages } = await supabase
            .from('messages')
            .select('id, content, message_type, created_at, conversation_id')
            .in('conversation_id', convIds)
            .ilike('content', `%${searchQuery}%`)
            .limit(10);

          // Get conversation titles separately
          const { data: convTitles } = await supabase
            .from('conversations')
            .select('id, title')
            .in('id', messages?.map(m => m.conversation_id) || []);

          const titleMap = convTitles?.reduce((acc, c) => {
            acc[c.id] = c.title || 'Conversation';
            return acc;
          }, {} as Record<string, string>) || {};

          messages?.forEach(msg => {
            results.push({
              id: msg.id,
              type: 'message',
              title: `Message dans "${titleMap[msg.conversation_id]}"`,
              content: msg.content.substring(0, 100) + '...',
              metadata: { 
                conversation_id: msg.conversation_id,
                message_type: msg.message_type 
              },
              created_at: msg.created_at
            });
          });
        }

      // Search catalogs
      if (activeFilters.includes('catalog')) {
        const { data: catalogs } = await supabase
          .from('catalogs')
          .select(`
            id, name, description, category, created_at,
            business_profiles!inner(id, business_name, user_id)
          `)
          .eq('business_profiles.user_id', user!.id)
          .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`);

        catalogs?.forEach(catalog => {
          results.push({
            id: catalog.id,
            type: 'catalog',
            title: catalog.name,
            content: catalog.description || `Catégorie: ${catalog.category}`,
            metadata: { 
              business_id: catalog.business_profiles.id,
              business_name: catalog.business_profiles.business_name 
            },
            created_at: catalog.created_at
          });
        });
      }

      // Sort by relevance and date
      results.sort((a, b) => {
        // Prioritize exact matches in title
        const aExact = a.title.toLowerCase().includes(searchQuery.toLowerCase());
        const bExact = b.title.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // Then by date
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setResults(results.slice(0, 20)); // Limit to 20 results
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'conversation': return <MessageSquare className="w-4 h-4" />;
      case 'catalog': return <Package className="w-4 h-4" />;
      case 'message': return <MessageSquare className="w-4 h-4" />;
      case 'order': return <ShoppingCart className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getResultColor = (type: string) => {
    switch (type) {
      case 'conversation': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'catalog': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'message': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'order': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-4"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Filter className="w-3 h-3" />
          Filtres:
        </div>
        {filters.map(filter => (
          <Button
            key={filter}
            variant={activeFilters.includes(filter) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFilter(filter)}
            className="h-7 text-xs"
          >
            {filter === 'conversation' && 'Conversations'}
            {filter === 'catalog' && 'Catalogues'}
            {filter === 'message' && 'Messages'}
            {filter === 'order' && 'Commandes'}
          </Button>
        ))}
      </div>

      {/* Results */}
      {query.trim() && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {loading ? "Recherche..." : `${results.length} résultat(s) trouvé(s)`}
            </p>
          </div>

          <ScrollArea className="h-96">
            <div className="space-y-2">
              {results.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className="p-3 rounded-lg border bg-card hover:bg-accent/5 cursor-pointer transition-colors"
                  onClick={() => onResultSelect?.(result)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getResultIcon(result.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate text-sm">
                          {result.title}
                        </h3>
                        <Badge 
                          className={`text-xs px-2 py-0.5 ${getResultColor(result.type)}`}
                        >
                          {result.type}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground truncate">
                        {result.content}
                      </p>
                      
                      {result.metadata && (
                        <div className="flex items-center gap-2 mt-1">
                          {result.metadata.business_name && (
                            <span className="text-xs text-muted-foreground">
                              📋 {result.metadata.business_name}
                            </span>
                          )}
                          {result.metadata.origin_type && (
                            <span className="text-xs text-muted-foreground">
                              🔗 {result.metadata.origin_type}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {formatTime(result.created_at)}
                    </div>
                  </div>
                </div>
              ))}
              
              {!loading && results.length === 0 && query.trim() && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Aucun résultat trouvé</p>
                  <p className="text-xs mt-1">Essayez d'autres mots-clés ou ajustez les filtres</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
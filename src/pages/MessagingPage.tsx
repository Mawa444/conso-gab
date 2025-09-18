import { useState, useEffect } from "react";
import { Search, Filter, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ConversationsList } from "@/components/messaging/ConversationsList";
import { ConversationDetails } from "@/components/messaging/ConversationDetails";
import { MessagingFilters } from "@/components/messaging/MessagingFilters";
import { useConversations } from "@/hooks/use-conversations";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export type ConversationFilter = 
  | "all" 
  | "orders" 
  | "reservations" 
  | "payments" 
  | "appointments" 
  | "catalogs" 
  | "support" 
  | "unread" 
  | "archived";

export const MessagingPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ConversationFilter>("all");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileConversation, setShowMobileConversation] = useState(false);
  
  const isMobile = useIsMobile();
  const { conversations, loading, refetch } = useConversations({
    search: searchQuery,
    filter: activeFilter
  });

  // Mobile: Show conversation details when one is selected
  useEffect(() => {
    if (isMobile && selectedConversationId) {
      setShowMobileConversation(true);
    }
  }, [selectedConversationId, isMobile]);

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const handleBackToList = () => {
    setShowMobileConversation(false);
    setSelectedConversationId(null);
  };

  // Desktop layout
  if (!isMobile) {
    return (
      <div className="flex h-screen bg-background">
        {/* Left Column - Conversations List */}
        <div className="w-1/3 border-r flex flex-col">
          {/* Header */}
          <div className="p-4 border-b space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Messagerie ConsoGab</h1>
                <p className="text-sm text-muted-foreground">
                  Toutes vos communications centralisées
                </p>
              </div>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Nouveau
              </Button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher entreprises, produits, commandes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filtres
                    {activeFilter !== "all" && (
                      <Badge variant="secondary" className="ml-1">1</Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <MessagingFilters
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    onClose={() => setShowFilters(false)}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-hidden">
            <ConversationsList
              conversations={conversations}
              loading={loading}
              selectedId={selectedConversationId}
              onSelect={handleConversationSelect}
              searchQuery={searchQuery}
              activeFilter={activeFilter}
            />
          </div>
        </div>

        {/* Right Column - Conversation Details */}
        <div className="flex-1 flex flex-col">
          {selectedConversationId ? (
            <ConversationDetails
              conversationId={selectedConversationId}
              onRefetch={refetch}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <Search className="w-6 h-6" />
                </div>
                <p>Sélectionnez une conversation pour commencer</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mobile layout
  return (
    <div className="flex flex-col h-screen bg-background">
      {!showMobileConversation ? (
        // Mobile - Conversations List
        <>
          {/* Header */}
          <div className="p-4 border-b space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold">Messagerie</h1>
                <p className="text-xs text-muted-foreground">
                  Communications centralisées
                </p>
              </div>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Nouveau
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Mobile Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={activeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("all")}
              >
                Tous
              </Button>
              <Button
                variant={activeFilter === "orders" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("orders")}
              >
                Commandes
              </Button>
              <Button
                variant={activeFilter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("unread")}
              >
                Non lus
              </Button>
              <Button
                variant={activeFilter === "appointments" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("appointments")}
              >
                RDV
              </Button>
            </div>
          </div>

          {/* Mobile Conversations List */}
          <div className="flex-1 overflow-hidden">
            <ConversationsList
              conversations={conversations}
              loading={loading}
              selectedId={selectedConversationId}
              onSelect={handleConversationSelect}
              searchQuery={searchQuery}
              activeFilter={activeFilter}
            />
          </div>
        </>
      ) : (
        // Mobile - Conversation Details
        <div className="flex flex-col h-full">
          {/* Mobile Header with Back Button */}
          <div className="p-4 border-b flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleBackToList}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <p className="font-medium">Conversation</p>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <ConversationDetails
              conversationId={selectedConversationId!}
              onRefetch={refetch}
            />
          </div>
        </div>
      )}
    </div>
  );
};
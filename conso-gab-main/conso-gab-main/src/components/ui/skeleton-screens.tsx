import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Home Page Skeleton
export const HomePageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 space-y-6 p-4">
      {/* Barre de recherche skeleton */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>

      {/* Actions rapides skeleton */}
      <div className="flex gap-2">
        <Skeleton className="flex-1 h-10 rounded-xl" />
        <Skeleton className="flex-1 h-10 rounded-xl" />
      </div>

      {/* Catégories skeleton */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="flex-shrink-0 w-48 h-16 rounded-2xl" />
        ))}
      </div>

      {/* Catalogues publics skeleton */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        </CardContent>
      </Card>

      {/* Publicité skeleton */}
      <Skeleton className="h-48 w-full rounded-2xl" />

      {/* Entreprises actives skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-8 rounded-full" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
        
        {Array.from({ length: 3 }).map((_, index) => (
          <CommerceCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

// Commerce Card Skeleton
export const CommerceCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-12 rounded-full" />
          <Skeleton className="h-6 w-6 rounded" />
        </div>
      </div>
      
      <div className="flex items-start justify-between mb-2">
        <Skeleton className="h-6 w-48" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-8" />
        </div>
      </div>
      
      <Skeleton className="h-4 w-full mb-4" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-10 rounded" />
          ))}
        </div>
        <Skeleton className="h-10 w-20 rounded-xl" />
      </div>
    </div>
  );
};

// Map Page Skeleton
export const MapPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex flex-col">
      {/* Header skeleton */}
      <div className="bg-card/95 border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="bg-card/50 border-b border-border/30 px-4">
        <div className="bg-muted/50 p-1 h-12 rounded-lg flex gap-2">
          <Skeleton className="flex-1 h-10 rounded" />
          <Skeleton className="flex-1 h-10 rounded" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <CommerceCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

// Profile Page Skeleton
export const ProfilePageSkeleton = () => {
  return (
    <div className="min-h-screen">
      {/* Header profile skeleton */}
      <div className="bg-gradient-to-br from-primary via-accent to-secondary p-6 text-white">
        <div className="flex items-center gap-4">
          <Skeleton className="w-24 h-24 rounded-2xl bg-white/20" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-40 bg-white/20" />
            <Skeleton className="h-4 w-60 bg-white/20" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-20 bg-white/20 rounded-full" />
              <Skeleton className="h-6 w-32 bg-white/20 rounded-full" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="w-10 h-10 bg-white/20 rounded" />
            ))}
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="bg-white/10 border-white/20 text-center">
              <CardContent className="p-4">
                <Skeleton className="h-8 w-16 mx-auto mb-2 bg-white/20" />
                <Skeleton className="h-4 w-20 mx-auto bg-white/20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tabs content skeleton */}
      <div className="p-6 space-y-6">
        {/* Tabs navigation skeleton */}
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-20 rounded" />
          ))}
        </div>
        
        {/* Content cards skeleton */}
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Messaging Page Skeleton - MIMO Chat (sera créé prochainement)

// Generic Grid Skeleton
export const GridSkeleton = ({ items = 6, columns = 2 }: { items?: number; columns?: number }) => {
  return (
    <div className={`grid grid-cols-${columns} gap-4`}>
      {Array.from({ length: items }).map((_, index) => (
        <Card key={index}>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Skeleton pour la liste des commerces
export const CommerceListSkeleton = () => (
  <div className="h-full flex flex-col animate-pulse">
    {/* Header de recherche skeleton */}
    <div className="bg-card/95 backdrop-blur-sm border-b border-border/50 p-4 space-y-4">
      <div className="flex gap-3">
        <div className="flex-1 h-11 bg-muted rounded-lg"></div>
        <div className="w-20 h-11 bg-muted rounded-lg"></div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-32 h-9 bg-muted rounded-lg"></div>
        ))}
      </div>
    </div>
    
    <div className="flex-1 overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4">
        {/* Sidebar skeleton */}
        <div className="lg:col-span-1 space-y-4">
          <div className="h-96 bg-muted rounded-lg"></div>
          <div className="h-48 bg-muted rounded-lg"></div>
        </div>
        
        {/* Commerce cards skeleton */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 w-40 bg-muted rounded"></div>
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Skeleton pour l'onglet carte
export const MapTabSkeleton = () => (
  <div className="h-full relative animate-pulse">
    {/* Barre de recherche skeleton */}
    <div className="absolute top-4 left-4 z-20 w-96 h-12 bg-muted rounded-lg"></div>
    
    {/* Contrôles skeleton */}
    <div className="absolute top-4 right-4 z-20 w-16 h-32 bg-muted rounded-lg"></div>
    
    {/* Stats skeleton */}
    <div className="absolute bottom-4 right-4 z-20 w-64 h-40 bg-muted rounded-lg"></div>
    
    {/* Légende skeleton */}
    <div className="absolute bottom-4 left-4 z-20 w-48 h-32 bg-muted rounded-lg"></div>
    
    {/* Fond de carte skeleton */}
    <div className="h-full w-full bg-muted rounded-lg"></div>
    
    {/* Points simulés */}
    {Array.from({ length: 8 }).map((_, i) => (
      <div 
        key={i}
        className="absolute w-8 h-8 bg-muted-foreground/30 rounded-full"
        style={{ 
          top: `${20 + (i * 10)}%`, 
          left: `${25 + (i * 8)}%` 
        }}
      />
    ))}
  </div>
);
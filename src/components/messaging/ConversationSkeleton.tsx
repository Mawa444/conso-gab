import { Skeleton } from "@/components/ui/skeleton";

export const ConversationSkeleton = () => {
  return (
    <div className="space-y-1">
      {/* Date group skeleton */}
      <div className="px-4 py-2">
        <Skeleton className="h-4 w-24" />
      </div>
      
      {/* Conversation items skeleton */}
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="mx-2 rounded-lg p-3">
          <div className="flex items-center gap-3">
            {/* Avatar skeleton */}
            <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
            
            {/* Content skeleton */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-12" />
              </div>
              
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-48" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-8 rounded-full" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const MessageHomePageSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="bg-gradient-to-r from-muted/20 to-accent/5 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="text-right space-y-1">
            <Skeleton className="h-8 w-8 ml-auto" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Services skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="h-6 w-48" />
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="border rounded-lg p-6 border-l-4">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <Skeleton className="w-6 h-6" />
              </div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions skeleton */}
      <div className="bg-card border rounded-lg p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-32" />
          ))}
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn(
    "animate-shimmer bg-gradient-to-r from-mimo-gray-200 via-mimo-gray-100 to-mimo-gray-200",
    "bg-[length:200%_100%] rounded",
    className
  )} />
);

// Skeleton pour une conversation dans la liste
export const ConversationSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 p-4 border-b border-mimo-gray-100">
    {/* Avatar */}
    <Skeleton className="w-14 h-14 rounded-full" />
    
    <div className="flex-1 space-y-2">
      {/* Nom de la conversation */}
      <Skeleton className="h-4 w-3/5" />
      {/* Dernier message */}
      <Skeleton className="h-3 w-4/5" />
    </div>
    
    <div className="text-right space-y-2">
      {/* Heure */}
      <Skeleton className="h-3 w-12 ml-auto" />
      {/* Badge non lu */}
      <Skeleton className="h-4 w-4 rounded-full ml-auto" />
    </div>
  </div>
);

// Skeleton pour une bulle de message
export const MessageSkeleton: React.FC<{ isOwn?: boolean }> = ({ isOwn = false }) => (
  <div className={cn(
    "flex gap-2 mb-4",
    isOwn ? "justify-end" : "justify-start"
  )}>
    {!isOwn && <Skeleton className="w-8 h-8 rounded-full mt-auto" />}
    
    <div className={cn(
      "max-w-[75%]",
      isOwn && "order-first"
    )}>
      <div className={cn(
        "px-4 py-3 rounded-bubble",
        isOwn 
          ? "bg-mimo-gray-200 rounded-tr-bubble-sm" 
          : "bg-mimo-gray-100 rounded-tl-bubble-sm"
      )}>
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    
    {isOwn && <div className="w-8" />}
  </div>
);

// Skeleton pour la liste des conversations
export const ConversationListSkeleton: React.FC = () => (
  <div className="divide-y divide-mimo-gray-100">
    {Array.from({ length: 8 }).map((_, index) => (
      <ConversationSkeleton key={index} />
    ))}
  </div>
);

// Skeleton pour les messages dans une conversation
export const MessageListSkeleton: React.FC = () => (
  <div className="p-4 space-y-4">
    <MessageSkeleton isOwn={false} />
    <MessageSkeleton isOwn={true} />
    <MessageSkeleton isOwn={false} />
    <MessageSkeleton isOwn={true} />
    <MessageSkeleton isOwn={false} />
  </div>
);

// Loader pour images avec progression
export const ImageLoader: React.FC<{ 
  src: string; 
  alt: string; 
  className?: string;
  onLoad?: () => void;
}> = ({ src, alt, className, onLoad }) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!loaded && !error && (
        <Skeleton className="absolute inset-0" />
      )}
      
      <img
        src={src}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={() => {
          setLoaded(true);
          onLoad?.();
        }}
        onError={() => setError(true)}
      />
      
      {error && (
        <div className="absolute inset-0 bg-mimo-gray-100 flex items-center justify-center">
          <span className="text-mimo-gray-400 text-sm">❌</span>
        </div>
      )}
    </div>
  );
};

// Spinner pour les actions de chargement
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn(
      "animate-spin rounded-full border-2 border-mimo-gray-300 border-t-primary-500",
      sizeClasses[size],
      className
    )} />
  );
};
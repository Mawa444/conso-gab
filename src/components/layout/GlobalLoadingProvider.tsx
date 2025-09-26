import { createContext, useContext, useState, ReactNode } from 'react';
import { GabonLoading } from '@/components/ui/gabon-loading';
import { useLoadingDetection } from '@/hooks/use-loading-detection';

interface GlobalLoadingContextType {
  setGlobalLoading: (loading: boolean, text?: string) => void;
  isGlobalLoading: boolean;
  loadingText?: string;
}

const GlobalLoadingContext = createContext<GlobalLoadingContextType | undefined>(undefined);

interface GlobalLoadingProviderProps {
  children: ReactNode;
}

export const GlobalLoadingProvider = ({ children }: GlobalLoadingProviderProps) => {
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [loadingText, setLoadingText] = useState<string>();

  const { showSlowLoadingUI } = useLoadingDetection(isGlobalLoading);

  const setGlobalLoading = (loading: boolean, text?: string) => {
    setIsGlobalLoading(loading);
    setLoadingText(text);
  };

  return (
    <GlobalLoadingContext.Provider value={{ setGlobalLoading, isGlobalLoading, loadingText }}>
      {children}
      
      {/* Overlay de chargement global */}
      {showSlowLoadingUI && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card p-8 rounded-2xl shadow-2xl border border-border/50">
            <GabonLoading 
              size="lg" 
              text={loadingText || "Chargement en cours..."} 
              className="scale-110"
            />
          </div>
        </div>
      )}
    </GlobalLoadingContext.Provider>
  );
};

export const useGlobalLoading = () => {
  const context = useContext(GlobalLoadingContext);
  if (context === undefined) {
    throw new Error('useGlobalLoading must be used within a GlobalLoadingProvider');
  }
  return context;
};
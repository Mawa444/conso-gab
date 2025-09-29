import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'system' 
}) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Récupérer le thème sauvegardé
    const savedTheme = localStorage.getItem('mimo-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const updateTheme = () => {
      let shouldBeDark = false;

      if (theme === 'system') {
        shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        shouldBeDark = theme === 'dark';
      }

      setIsDark(shouldBeDark);
      
      // Appliquer le thème au DOM
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    };

    updateTheme();

    // Écouter les changements de préférence système
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('mimo-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Variables CSS pour le mode sombre (à ajouter à index.css)
export const darkModeStyles = `
[data-theme="dark"] {
  /* Couleurs de base */
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --surface: #374151;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --text-muted: #9ca3af;
  
  /* Couleurs MIMO spécifiques */
  --mimo-gray-50: #374151;
  --mimo-gray-100: #4b5563;
  --mimo-gray-200: #6b7280;
  --mimo-gray-300: #9ca3af;
  --mimo-gray-400: #d1d5db;
  --mimo-gray-500: #e5e7eb;
  --mimo-gray-600: #f3f4f6;
  --mimo-gray-700: #f9fafb;
  --mimo-gray-800: #ffffff;
  --mimo-gray-900: #ffffff;
  
  /* Bulles de messages */
  --mimo-incoming: #374151;
  --mimo-outgoing: #065f46;
  
  /* Ombres */
  --shadow-mimo-1: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-mimo-4: 0 4px 6px rgba(0,0,0,0.3);
  --shadow-mimo-8: 0 8px 25px rgba(0,0,0,0.4);
  
  /* Bordures */
  --border-color: #374151;
}

/* Styles pour les composants en mode sombre */
[data-theme="dark"] .bg-white {
  background-color: var(--bg-secondary);
}

[data-theme="dark"] .bg-mimo-gray-50 {
  background-color: var(--mimo-gray-50);
}

[data-theme="dark"] .text-mimo-gray-900 {
  color: var(--text-primary);
}

[data-theme="dark"] .text-mimo-gray-600 {
  color: var(--text-secondary);
}

[data-theme="dark"] .border-mimo-gray-200 {
  border-color: var(--border-color);
}

/* Animations personnalisées pour le mode sombre */
[data-theme="dark"] .animate-shimmer {
  background: linear-gradient(
    90deg,
    var(--mimo-gray-100) 0%, 
    var(--mimo-gray-200) 50%, 
    var(--mimo-gray-100) 100%
  );
  background-size: 200% 100%;
}
`;
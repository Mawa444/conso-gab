/**
 * Accessibility Utilities for WCAG 2.1 AA Compliance
 * Provides utilities for keyboard navigation, screen readers, and focus management
 */

import { useEffect, useRef, useCallback } from 'react';

// Focus management utilities
export const focusUtils = {
  /**
   * Move focus to the next focusable element
   */
  focusNext: (currentElement: HTMLElement) => {
    const focusableElements = getFocusableElements(currentElement.ownerDocument);
    const currentIndex = focusableElements.indexOf(currentElement);
    const nextIndex = (currentIndex + 1) % focusableElements.length;
    focusableElements[nextIndex]?.focus();
  },

  /**
   * Move focus to the previous focusable element
   */
  focusPrevious: (currentElement: HTMLElement) => {
    const focusableElements = getFocusableElements(currentElement.ownerDocument);
    const currentIndex = focusableElements.indexOf(currentElement);
    const prevIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
    focusableElements[prevIndex]?.focus();
  },

  /**
   * Trap focus within a container (for modals, dialogs)
   */
  trapFocus: (container: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }

      // Escape key handling
      if (e.key === 'Escape') {
        const escapeEvent = new CustomEvent('a11y:escape', {
          bubbles: true,
          detail: { container }
        });
        container.dispatchEvent(escapeEvent);
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Focus first element
    firstElement?.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  },

  /**
   * Auto-focus first focusable element in container
   */
  autoFocus: (container: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    focusableElements[0]?.focus();
  },

  /**
   * Restore focus to previously focused element
   */
  restoreFocus: (previouslyFocusedElement?: HTMLElement) => {
    if (previouslyFocusedElement && document.contains(previouslyFocusedElement)) {
      previouslyFocusedElement.focus();
    } else {
      // Fallback to body or first focusable element
      document.body.focus();
    }
  },
};

/**
 * Get all focusable elements in a container
 */
function getFocusableElements(container: Document | HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ];

  const elements = container.querySelectorAll(focusableSelectors.join(', '));
  return Array.from(elements) as HTMLElement[];
}

// Screen reader utilities
export const screenReaderUtils = {
  /**
   * Announce content to screen readers
   */
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';

    document.body.appendChild(announcement);
    announcement.textContent = message;

    // Remove after announcement
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement);
      }
    }, 1000);
  },

  /**
   * Create a live region for dynamic content
   */
  createLiveRegion: (priority: 'polite' | 'assertive' = 'polite') => {
    const region = document.createElement('div');
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'false');
    region.style.position = 'absolute';
    region.style.left = '-10000px';
    region.style.width = '1px';
    region.style.height = '1px';
    region.style.overflow = 'hidden';

    document.body.appendChild(region);

    return {
      announce: (message: string) => {
        region.textContent = message;
      },
      destroy: () => {
        if (region.parentNode) {
          region.parentNode.removeChild(region);
        }
      },
    };
  },
};

// Color and contrast utilities
export const colorUtils = {
  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio: (color1: string, color2: string): number => {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  /**
   * Check if contrast ratio meets WCAG standards
   */
  meetsContrastStandard: (
    foreground: string,
    background: string,
    level: 'AA' | 'AAA' = 'AA',
    size: 'normal' | 'large' = 'normal'
  ): boolean => {
    const ratio = colorUtils.getContrastRatio(foreground, background);

    if (level === 'AAA') {
      return size === 'large' ? ratio >= 4.5 : ratio >= 7;
    } else {
      return size === 'large' ? ratio >= 3 : ratio >= 4.5;
    }
  },
};

/**
 * Get relative luminance of a color
 */
function getLuminance(color: string): number {
  // Convert hex to RGB
  const rgb = hexToRgb(color);
  if (!rgb) return 0;

  const { r, g, b } = rgb;

  // Convert to linear RGB
  const toLinear = (c: number) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  const rLinear = toLinear(r);
  const gLinear = toLinear(g);
  const bLinear = toLinear(b);

  // Calculate luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

// React hooks for accessibility
export const useAccessibility = () => {
  const liveRegionRef = useRef<ReturnType<typeof screenReaderUtils.createLiveRegion>>();

  useEffect(() => {
    liveRegionRef.current = screenReaderUtils.createLiveRegion();

    return () => {
      liveRegionRef.current?.destroy();
    };
  }, []);

  const announce = useCallback((message: string, priority?: 'polite' | 'assertive') => {
    if (liveRegionRef.current) {
      liveRegionRef.current.announce(message);
    } else {
      screenReaderUtils.announce(message, priority);
    }
  }, []);

  return { announce };
};

// Keyboard navigation hook
export const useKeyboardNavigation = (
  onEnter?: () => void,
  onEscape?: () => void,
  onArrowUp?: () => void,
  onArrowDown?: () => void
) => {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        onEnter?.();
        break;
      case 'Escape':
        onEscape?.();
        break;
      case 'ArrowUp':
        e.preventDefault();
        onArrowUp?.();
        break;
      case 'ArrowDown':
        e.preventDefault();
        onArrowDown?.();
        break;
    }
  }, [onEnter, onEscape, onArrowUp, onArrowDown]);

  return { handleKeyDown };
};

// Focus trap hook for modals
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement>();

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store currently focused element
    previouslyFocusedElementRef.current = document.activeElement as HTMLElement;

    // Trap focus
    const cleanup = focusUtils.trapFocus(containerRef.current);

    return cleanup;
  }, [isActive]);

  useEffect(() => {
    if (!isActive && previouslyFocusedElementRef.current) {
      // Restore focus when trap is deactivated
      focusUtils.restoreFocus(previouslyFocusedElementRef.current);
    }
  }, [isActive]);

  return containerRef;
};

// Skip link hook
export const useSkipLinks = () => {
  useEffect(() => {
    const handleSkipLink = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && e.shiftKey === false) {
        // Focus is moving forward, check if we're at the first focusable element
        const focusableElements = getFocusableElements(document);
        if (focusableElements[0] === document.activeElement) {
          // Announce skip links are available
          screenReaderUtils.announce('Navigation rapide disponible. Appuyez sur Tab pour continuer.', 'polite');
        }
      }
    };

    document.addEventListener('keydown', handleSkipLink);
    return () => document.removeEventListener('keydown', handleSkipLink);
  }, []);
};

// ARIA utilities
export const ariaUtils = {
  /**
   * Generate unique IDs for ARIA relationships
   */
  generateId: (prefix: string = 'a11y') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Set up ARIA relationships between elements
   */
  linkElements: (
    controlId: string,
    targetId: string,
    relationship: 'labelledby' | 'describedby' | 'controls' | 'owns' = 'labelledby'
  ) => {
    const control = document.getElementById(controlId);
    const target = document.getElementById(targetId);

    if (control && target) {
      control.setAttribute(`aria-${relationship}`, targetId);
    }
  },

  /**
   * Update live region content
   */
  updateLiveRegion: (regionId: string, content: string) => {
    const region = document.getElementById(regionId);
    if (region) {
      region.textContent = content;
    }
  },
};

// Motion preferences (for users who prefer reduced motion)
export const motionUtils = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Apply motion-safe styles
   */
  getMotionSafeValue: (defaultValue: string, reducedValue: string = 'none') => {
    return motionUtils.prefersReducedMotion() ? reducedValue : defaultValue;
  },
};

// High contrast mode detection
export const contrastUtils = {
  /**
   * Check if high contrast mode is active
   */
  isHighContrast: () => {
    const testElement = document.createElement('div');
    testElement.style.color = 'rgb(31, 41, 55)'; // Tailwind gray-800
    testElement.style.backgroundColor = 'rgb(255, 255, 255)'; // White
    document.body.appendChild(testElement);

    const computedStyle = window.getComputedStyle(testElement);
    const isHighContrast = computedStyle.color === computedStyle.backgroundColor;

    document.body.removeChild(testElement);
    return isHighContrast;
  },
};
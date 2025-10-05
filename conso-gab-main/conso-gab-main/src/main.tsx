import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { performanceMonitor } from "@/lib/monitoring/performance-monitor";
import { errorTracker } from "@/lib/monitoring/error-tracker";

// Initialize monitoring
if (!import.meta.env.DEV) {
  performanceMonitor.init();
  
  // Log performance report après 5 secondes
  setTimeout(() => {
    performanceMonitor.logPerformanceReport();
  }, 5000);
}

// Global error handler
window.addEventListener('error', (event) => {
  // Safely extract error information
  const error = event.error instanceof Error 
    ? event.error 
    : new Error(String(event.message || 'Unknown error'));
    
  errorTracker.trackError(error, {
    type: 'global-error',
  });
});

window.addEventListener('unhandledrejection', (event) => {
  // Safely handle promise rejection
  const message = event.reason?.message || event.reason?.toString() || 'Unhandled Promise Rejection';
  errorTracker.trackError(
    new Error(String(message)),
    {
      type: 'unhandled-rejection',
    }
  );
});

createRoot(document.getElementById("root")!).render(<App />);

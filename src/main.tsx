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
  errorTracker.trackError(event.error, {
    type: 'global-error',
  });
});

window.addEventListener('unhandledrejection', (event) => {
  errorTracker.trackError(
    new Error(event.reason?.message || 'Unhandled Promise Rejection'),
    {
      type: 'unhandled-rejection',
      reason: event.reason,
    }
  );
});

createRoot(document.getElementById("root")!).render(<App />);

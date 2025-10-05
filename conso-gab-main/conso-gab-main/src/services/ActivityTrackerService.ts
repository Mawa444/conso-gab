
let activityTimer: NodeJS.Timeout;

const activityEvents: (keyof WindowEventMap)[] = [
  'mousemove',
  'keydown',
  'scroll',
  'click',
  'touchstart',
];

export const ActivityTrackerService = {
  start(onInactive: () => void, inactiveTimeout: number = 40000) {
    const resetTimer = () => {
      clearTimeout(activityTimer);
      activityTimer = setTimeout(onInactive, inactiveTimeout);
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    resetTimer(); // Initial start
  },

  stop() {
    clearTimeout(activityTimer);
    activityEvents.forEach((event) => {
      // The type casting is needed here because the listener function is anonymous
      window.removeEventListener(event, () => {});
    });
  },
};
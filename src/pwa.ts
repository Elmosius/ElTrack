import { registerSW } from 'virtual:pwa-register';

registerSW({
  immediate: true,
  onNeedReload() {},
  onRegisteredSW(_swUrl, registration) {
    if (!registration) {
      return;
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        void registration.update();
      }
    });
  },
});

import { useSyncExternalStore } from 'react';

const query = '(prefers-reduced-motion: reduce)';
let preference;
function getPreference() {
  return (preference ??= window.matchMedia(query));
}
function subscribe(notify) {
  const media = getPreference();
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, () => getPreference().matches, () => false);
}

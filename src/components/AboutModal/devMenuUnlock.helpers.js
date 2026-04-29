export const DEV_MENU_TAP_THRESHOLD = 3;
export const DEV_MENU_UNLOCK_KEY = 'devMenuUnlocked';

export function registerDevMenuTap(currentCount, threshold = DEV_MENU_TAP_THRESHOLD) {
  const nextCount = currentCount + 1;

  if (nextCount >= threshold) {
    return {
      unlocked: true,
      nextCount: 0,
    };
  }

  return {
    unlocked: false,
    nextCount,
  };
}

export function isDevMenuUnlocked() {
  return localStorage.getItem(DEV_MENU_UNLOCK_KEY) === 'true';
}

export function unlockDevMenu() {
  localStorage.setItem(DEV_MENU_UNLOCK_KEY, 'true');
}

// Utility to check environment
export function isLocalhost() {
  const host = window?.location?.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}
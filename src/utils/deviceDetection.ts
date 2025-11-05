/**
 * Detect if the user is on a mobile device
 */
export function isMobileDevice(): boolean {
  // Check screen width
  const isMobileWidth = window.innerWidth < 768;
  
  // Check user agent
  const userAgent = navigator.userAgent || navigator.vendor || '';
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const isMobileUA = mobileRegex.test(userAgent);
  
  return isMobileWidth || isMobileUA;
}

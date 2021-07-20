let _isMobile: boolean;
export function isMobile() {
  if (_isMobile === undefined) {
    const isMobileMatch =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(max-device-width: 680px)');
    _isMobile = isMobileMatch && isMobileMatch.matches;
  }
  return _isMobile;
}

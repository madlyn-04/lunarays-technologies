(() => {
  const banner = document.getElementById('cookieConsentBanner');
  if (!banner) return;

  const preferenceKey = 'lunarays-cookie-preference';
  try {
    if (window.localStorage.getItem(preferenceKey)) return;
  } catch {
    // Keep the notice usable when browser storage is unavailable.
  }

  banner.hidden = false;
  banner.querySelectorAll('[data-cookie-choice]').forEach(button => {
    button.addEventListener('click', () => {
      const choice = button.dataset.cookieChoice;
      try {
        window.localStorage.setItem(preferenceKey, choice);
      } catch {
        // The banner can still be dismissed for this page view.
      }
      banner.hidden = true;
      window.dispatchEvent(new CustomEvent('lunarays:cookie-consent', { detail: { choice } }));
    });
  });
})();
/**
 * Matomo Analytics Integration
 * Tracks page views and user interactions
 */

export function initMatomo() {
  // Initialize Matomo tracking array
  window._paq = window._paq || []
  
  const _paq = window._paq
  
  // Track initial page view
  _paq.push(['trackPageView'])
  _paq.push(['enableLinkTracking'])
  
  // Use PHP proxy to avoid ad blockers
  _paq.push(['setTrackerUrl', '/matomo-proxy.php?file=matomo.php'])
  _paq.push(['setSiteId', '1'])
  
  const d = document
  const g = d.createElement('script')
  const s = d.getElementsByTagName('script')[0]
  
  g.async = true
  g.src = '/matomo-proxy.php?file=matomo.js'
  s.parentNode.insertBefore(g, s)
}

export function trackPageView(pageTitle, pageUrl) {
  if (window._paq) {
    window._paq.push(['setCustomUrl', pageUrl])
    window._paq.push(['setDocumentTitle', pageTitle])
    window._paq.push(['trackPageView'])
  }
}

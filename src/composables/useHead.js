function getOrCreateMeta(attribute, value) {
  let element = document.querySelector(`meta[${attribute}="${value}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, value)
    document.head.appendChild(element)
  }
  return element
}

export function useHead() {
  function setHead({ title, description, ogImage, ogUrl, ogType }) {
    // Update document title
    if (title) {
      document.title = title
    }

    // Update meta description
    if (description) {
      const meta = getOrCreateMeta('name', 'description')
      meta.setAttribute('content', description)
    }

    // Update Open Graph tags
    if (title) {
      const ogTitle = getOrCreateMeta('property', 'og:title')
      ogTitle.setAttribute('content', title)
    }

    if (description) {
      const ogDesc = getOrCreateMeta('property', 'og:description')
      ogDesc.setAttribute('content', description)
    }

    if (ogImage) {
      const ogImg = getOrCreateMeta('property', 'og:image')
      ogImg.setAttribute('content', ogImage)
    }

    // Set og:type (defaults to 'website')
    const ogTypeEl = getOrCreateMeta('property', 'og:type')
    ogTypeEl.setAttribute('content', ogType || 'website')

    // Set og:url from current location if not provided
    const ogUrlEl = getOrCreateMeta('property', 'og:url')
    ogUrlEl.setAttribute('content', ogUrl || window.location.href)
  }

  return { setHead }
}

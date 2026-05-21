/**
 * Composable for adding JSON-LD structured data to pages
 */
export function useStructuredData(data) {
  // Check if script already exists with same data
  const scriptId = `structured-data-${JSON.stringify(data).substring(0, 50).replace(/[^a-z0-9]/gi, '')}`
  
  // Remove existing script if it exists
  const existingScript = document.getElementById(scriptId)
  if (existingScript) {
    existingScript.remove()
  }
  
  // Create new script element
  const script = document.createElement('script')
  script.id = scriptId
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
}

/**
 * Generate Person schema for the author
 */
export function generatePersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Michael Hitzelberger',
    jobTitle: 'Autor',
    url: 'https://mhitzelberger.de',
    description: 'Autor von Gedichten, Kinderbüchern und Kurzgeschichten'
  }
}

/**
 * Generate Book schema
 */
export function generateBookSchema(book) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.subtitle ? `${book.title} - ${book.subtitle}` : book.title,
    author: {
      '@type': 'Person',
      name: 'Michael Hitzelberger'
    },
    inLanguage: 'de',
    url: `https://mhitzelberger.de/books/${book.url}`
  }

  // Add description if available
  if (book.description) {
    // Strip HTML tags for schema
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = book.description
    schema.description = tempDiv.textContent || tempDiv.innerText || ''
  }

  // Add image if available
  if (book.image) {
    const imageExt = book.imagetype || 'jpg'
    schema.image = `https://mhitzelberger.de/images/${book.image.replace(/\.(jpg|png)$/, '')}.${imageExt}`
  }

  // Add book format if shop links exist
  if (book.hasShopLinks && book.shop) {
    if (book.shop.types.includes('print')) {
      schema.bookFormat = 'Paperback'
    }
    if (book.shop.types.includes('ebook')) {
      schema.bookFormat = schema.bookFormat ? ['Paperback', 'EBook'] : 'EBook'
    }
  }

  return schema
}

/**
 * Generate CreativeWork schema for blog posts/poems
 */
export function generateCreativeWorkSchema(entry) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    headline: entry.title,
    author: {
      '@type': 'Person',
      name: 'Michael Hitzelberger'
    },
    inLanguage: entry.tags?.includes('english') ? 'en' : 'de',
    url: `https://mhitzelberger.de/blog/${entry.url}`
  }

  // Add publication date if available
  if (entry.date) {
    schema.datePublished = entry.date
  }

  // Add genre based on type
  if (entry.type === 'poem') {
    schema.genre = 'Poetry'
  } else if (entry.type === 'text') {
    schema.genre = 'Short Story'
  }

  // Add image if available
  if (entry.image) {
    schema.image = `https://mhitzelberger.de/images/${entry.image}`
  }

  // Add text excerpt
  if (entry.intro) {
    schema.abstract = entry.intro
  }

  return schema
}

/**
 * Generate WebSite schema for the homepage
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Michael Hitzelberger',
    url: 'https://mhitzelberger.de',
    description: 'Gedichte, Bücher und mehr von Michael Hitzelberger',
    inLanguage: ['de', 'en'],
    author: {
      '@type': 'Person',
      name: 'Michael Hitzelberger'
    }
  }
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}

export const SITE = {
  name: 'Boralba Lighting',
  legalName: 'BORALBA LIGHTING, S.L.',
  url: 'https://albertollamass.github.io/web-boralba',
  locale: 'es_ES',
  language: 'es',
  phone: '(34) 91 870 71 13',
  phoneHref: 'tel:+34918707113',
  email: 'boralba@boralba.es',
  address: 'Calle Destreza, 3. Nave D10, Polígono Los Olivos, 28906 Getafe (Madrid)',
  description:
    'Boralba Lighting: soluciones profesionales de iluminación LED para arquitectura, interiorismo, retail y espacios públicos. Asesoramiento, diseño, suministro Tridonic, marca propia HALOPACK y puesta en marcha.',
}

export function canonicalFor(path = '/') {
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${SITE.url}${clean === '/' ? '/' : clean}`
}

export function pageTitle(title) {
  if (!title) return `${SITE.name} | Iluminación LED profesional`
  if (title.includes(SITE.name)) return title
  return `${title} | ${SITE.name}`
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.legalName,
    url: SITE.url,
    logo: `${SITE.url}/images/logo.png`,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+34-918707113',
        email: SITE.email,
        contactType: 'sales',
        areaServed: 'ES',
        availableLanguage: ['es'],
      },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Calle Destreza, 3. Nave D10, Polígono Los Olivos',
      postalCode: '28906',
      addressLocality: 'Getafe',
      addressRegion: 'Madrid',
      addressCountry: 'ES',
    },
    sameAs: [
      'https://www.facebook.com/profile.php?id=100063786154063',
      'https://www.instagram.com/boralbalighting/',
    ],
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    inLanguage: SITE.language,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE.url}/buscar?q={query}`,
      'query-input': 'required name=query',
    },
  }
}

export function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

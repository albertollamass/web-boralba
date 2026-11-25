import { useEffect } from 'react'
import { SITE, canonicalFor, pageTitle } from '../../domain/site/site'
import { seoCanonical } from '../../domain/site/seo.js'

function upsertMeta(attr, key, value) {
  if (!value) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export default function Seo({
  title,
  description = SITE.description,
  path = '/',
  image = `${SITE.url}/images/portada-catalogo.png`,
  noindex = false,
  jsonLd = null,
  seo = null,
}) {
  const resolvedTitle = seo?.title || title
  const resolvedDescription = seo?.description || description
  const fullTitle = pageTitle(resolvedTitle)
  const canonical = seoCanonical(seo?.canonical, canonicalFor(path).replace(SITE.url, ''))
  const resolvedNoindex = seo?.noindex ?? noindex

  useEffect(() => {
    document.title = fullTitle
    document.documentElement.lang = 'es'
    upsertMeta('name', 'description', resolvedDescription)
    upsertMeta('name', 'robots', resolvedNoindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')
    upsertLink('canonical', canonical)
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:site_name', SITE.name)
    upsertMeta('property', 'og:locale', SITE.locale)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', resolvedDescription)
    upsertMeta('property', 'og:url', canonical)
    upsertMeta('property', 'og:image', image)
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', resolvedDescription)
    upsertMeta('name', 'twitter:image', image)
  }, [fullTitle, resolvedDescription, canonical, image, resolvedNoindex])

  if (!jsonLd) return null
  const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd]
  return (
    <>
      {blocks.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </>
  )
}

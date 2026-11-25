import { SITE } from './site.js'

export function seoFields(entity = {}) {
  const seo = entity.seo || {}
  return {
    title: seo.title || entity.seoTitle || '',
    description: seo.description || entity.seoDescription || entity.description || '',
    h1: seo.h1 || '',
    content: seo.content || '',
    canonical: seo.canonical || '',
    noindex: Boolean(seo.noindex ?? entity.noindex),
    focusKeyword: seo.focusKeyword || '',
    secondaryKeywords: Array.isArray(seo.secondaryKeywords) ? seo.secondaryKeywords : [],
  }
}

export function seoCanonical(value, fallback = '/') {
  if (!value) return `${SITE.url}${fallback.startsWith('/') ? fallback : `/${fallback}`}`
  return /^https?:\/\//i.test(value) ? value : `${SITE.url}/${String(value).replace(/^\//, '')}`
}

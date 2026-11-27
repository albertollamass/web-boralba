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
  const source = value || fallback
  const absolute = /^https?:\/\//i.test(source) ? source : `${SITE.url}/${String(source).replace(/^\//, '')}`
  const url = new URL(absolute)
  url.pathname = `${url.pathname.replace(/\/+$/, '')}/`
  return url.toString()
}

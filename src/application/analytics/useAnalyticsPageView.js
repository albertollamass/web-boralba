import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

function parseUrl(value) {
  try {
    return new URL(value)
  } catch {
    return undefined
  }
}

export function useAnalyticsPageView(analytics) {
  const location = useLocation()
  const lastPath = useRef('')
  useEffect(() => {
    if (!analytics || location.pathname.startsWith('/admin')) return
    const path = location.pathname
    if (lastPath.current === path) return
    lastPath.current = path
    const referrerUrl = document.referrer ? parseUrl(document.referrer) : undefined
    const referrer = referrerUrl?.pathname
    const referrerHost = referrerUrl?.hostname
    const aiHosts = ['chat.openai.com', 'chatgpt.com', 'gemini.google.com', 'perplexity.ai', 'claude.ai']
    const searchHosts = ['google.', 'bing.com', 'duckduckgo.com', 'yahoo.']
    const sourceCategory = referrerHost && aiHosts.some((host) => referrerHost === host || referrerHost.endsWith(`.${host}`))
      ? 'ai_assistant'
      : referrerHost && searchHosts.some((host) => referrerHost.includes(host))
        ? 'search_engine'
        : referrerHost
          ? 'referral'
          : 'direct'
    analytics.track('page_view', { page_location: `${window.location.origin}${path}`, page_path: path, page_referrer: referrer, source_category: sourceCategory })
  }, [analytics, location.pathname, location.search])
}

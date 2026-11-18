import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export function useAnalyticsPageView(analytics) {
  const location = useLocation()
  const lastPath = useRef('')
  useEffect(() => {
    if (!analytics || location.pathname.startsWith('/admin')) return
    const path = `${location.pathname}${location.search}`
    if (lastPath.current === path) return
    lastPath.current = path
    const referrer = document.referrer || undefined
    const referrerHost = referrer ? new URL(referrer).hostname : undefined
    const aiHosts = ['chat.openai.com', 'chatgpt.com', 'gemini.google.com', 'perplexity.ai', 'claude.ai']
    const searchHosts = ['google.', 'bing.com', 'duckduckgo.com', 'yahoo.']
    const sourceCategory = referrerHost && aiHosts.some((host) => referrerHost === host || referrerHost.endsWith(`.${host}`))
      ? 'ai_assistant'
      : referrerHost && searchHosts.some((host) => referrerHost.includes(host))
        ? 'search_engine'
        : referrerHost
          ? 'referral'
          : 'direct'
    analytics.track('page_view', { page_location: window.location.href, page_path: path, page_referrer: referrer, source_category: sourceCategory })
  }, [analytics, location.pathname, location.search])
}

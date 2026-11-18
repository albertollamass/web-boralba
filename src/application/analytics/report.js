const endpoint = import.meta.env.VITE_ANALYTICS_REPORT_URL
export const isAnalyticsReportConfigured = Boolean(endpoint)

export async function fetchAnalyticsReport({ token, from, to, family, productQuery } = {}) {
  if (!endpoint) return { status: 'unconfigured' }
  const params = new URLSearchParams({ from, to })
  if (family) params.set('family', family)
  if (productQuery) params.set('product', productQuery)
  const response = await fetch(`${endpoint}?${params}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  if (!response.ok) throw new Error(`Analytics report failed (${response.status})`)
  return { status: 'ready', data: await response.json() }
}

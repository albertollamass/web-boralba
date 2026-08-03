export function normalizeText(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function extractPower(query) {
  const m = String(query || '').match(/(\d+(?:[.,]\d+)?)\s*w\b/i)
  if (m) return parseFloat(m[1].replace(',', '.'))
  const num = String(query || '').trim().match(/^\d+(?:[.,]\d+)?$/)
  return num ? parseFloat(num[0].replace(',', '.')) : null
}

function parsePowerValue(value) {
  const m = String(value || '').match(/(\d+(?:[.,]\d+)?)\s*w/i)
  if (!m) return null
  return parseFloat(m[1].replace(',', '.'))
}

function hasPowerSpec(product, qPower) {
  if (qPower == null) return false
  return (product.specs || []).some((s) => {
    if (normalizeText(s.label) !== 'potencia') return false
    const v = parsePowerValue(s.value)
    return v != null && Math.abs(v - qPower) < 0.001
  })
}

function powerTokenIn(value, qPower) {
  if (qPower == null) return false
  const str = normalizeText(value)
  const token = `(?:^|[^0-9])${qPower}(?:w)?(?![0-9])`
  return new RegExp(token).test(str)
}

function productText(p) {
  const parts = [p.name, p.ref, p.description]
  ;(p.specs || []).forEach((s) => parts.push(s.label, s.value))
  ;(p.features || []).forEach((f) => parts.push(f))
  ;(p.applications || []).forEach((a) => parts.push(a))
  ;(p.advantages || []).forEach((a) => parts.push(a))
  ;(p.tags || []).forEach((t) => parts.push(t))
  return parts.map(normalizeText).filter(Boolean).join(' ')
}

function tokenContains(haystack, token) {
  if (!token) return false
  return haystack.split(' ').some((w) => w.includes(token))
}

export function searchProducts(products, query) {
  const q = normalizeText(query)
  if (!q) return []

  const qPower = extractPower(query)
  const qTokens = q.split(' ').filter((t) => !/^\d+(?:[.,]\d+)?w?$/.test(t))
  const isPowerQuery = qPower != null

  const scored = products.map((p) => {
    let score = 0
    const haystack = productText(p)
    const name = normalizeText(p.name)
    const ref = normalizeText(p.ref)

    if (isPowerQuery) {
      const powerMatch =
        hasPowerSpec(p, qPower) || powerTokenIn(name, qPower) || powerTokenIn(ref, qPower)
      if (!powerMatch) return null
      score += 100
    }

    const extraTokens = qTokens.filter((t) => t.length >= 2)
    if (extraTokens.every((t) => tokenContains(haystack, t))) {
      score += 20
    } else if (extraTokens.length > 0) {
      return null
    }

    if (name.includes(q)) score += 50
    if (ref.includes(q)) score += 30
    if (haystack.includes(q)) score += 10

    return { product: p, score }
  })

  return scored
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.product)
}

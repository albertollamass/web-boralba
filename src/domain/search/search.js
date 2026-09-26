export const DEFAULT_SEARCH_SYNONYMS = [
  { terms: ['calida', 'calido', 'calida'], field: 'temperature', values: ['2700k', '3000k', 'luz calida'] },
  { terms: ['neutra', 'neutro'], field: 'temperature', values: ['4000k', 'luz neutra'] },
  { terms: ['fria', 'frio'], field: 'temperature', values: ['5000k', '6000k', 'luz fria'] },
  { terms: ['empotrable', 'empotrado'], field: 'all', values: ['instalacion empotrable', 'empotrar', 'empotrable'] },
  { terms: ['superficie'], field: 'all', values: ['instalacion en superficie', 'superficie'] },
  { terms: ['exterior'], field: 'ip', values: ['ip65', 'ip67', 'ip68'] },
  { terms: ['armario'], field: 'application', values: ['sensor armario', 'iluminacion interior de armario', 'armario'] },
  { terms: ['controlador', 'controladores', 'mando', 'mandos'], field: 'category', values: ['controlador', 'driver', 'mando'] },
  { terms: ['inteligente'], field: 'technical', values: ['casambi', 'dali', 'dmx', 'alexa', 'zigbee'] },
]

export function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const asText = (value) => {
  if (Array.isArray(value)) return value.map(asText).join(' ')
  if (value && typeof value === 'object') return Object.values(value).map(asText).join(' ')
  return String(value || '')
}

const fieldText = (product) => {
  const specs = (product.specs || []).map((spec) => `${spec.label || ''} ${spec.value || ''} ${spec.unit || ''}`).join(' ')
  const applications = asText(product.applications)
  const features = asText(product.features)
  const tags = asText(product.tags)
  const technical = `${specs} ${features} ${tags}`
  return {
    name: normalizeText(product.name),
    ref: normalizeText(product.ref),
    category: normalizeText(`${product.categoryName || ''} ${product.categorySearch || ''} ${product.category || ''}`),
    description: normalizeText(product.description),
    application: normalizeText(applications),
    technical: normalizeText(technical),
    all: normalizeText(`${product.name || ''} ${product.ref || ''} ${product.categoryName || ''} ${product.categorySearch || ''} ${product.category || ''} ${product.description || ''} ${applications} ${technical}`),
    specs: (product.specs || []).map((spec) => ({ label: normalizeText(spec.label), value: normalizeText(`${spec.value || ''} ${spec.unit || ''}`) })),
  }
}

const specValues = (fields, labels) => fields.specs.filter((spec) => labels.some((label) => spec.label === label || spec.label.includes(label))).map((spec) => spec.value).join(' ')
const compactUnits = (value) => normalizeText(value).replace(/(\d)\s+(?=[a-z])/g, '$1')

function numericSpec(fields, labels) {
  const value = specValues(fields, labels)
  const match = value.match(/(?:^|\D)(\d+(?:[.,]\d+)?)(?:\s*)(?:k|v|w|%|$)/i)
  return match ? Number(match[1].replace(',', '.')) : null
}

function matchesTechnicalCondition(fields, condition) {
  if (condition.type === 'voltage') return numericSpec(fields, ['voltaje', 'tension']) === condition.value
  if (condition.type === 'ip') return numericSpec(fields, ['ip', 'proteccion ip']) >= condition.value
  if (condition.type === 'cri') return numericSpec(fields, ['cri', 'reproduccion cromatica']) >= condition.value
  if (condition.type === 'temperature') {
    const values = compactUnits(specValues(fields, ['temperatura', 'temperatura de color']))
    return condition.values.some((value) => values.includes(compactUnits(value)))
  }
  return false
}

function matchesValue(fields, field, values) {
  if (field === 'temperature') {
    const actual = compactUnits(`${specValues(fields, ['temperatura', 'temperatura de color'])} ${fields.technical} ${fields.application}`)
    return values.some((value) => actual.includes(compactUnits(value)))
  }
  if (field === 'ip') {
    const actual = numericSpec(fields, ['ip', 'proteccion ip'])
    const requested = values.map((value) => Number(normalizeText(value).match(/\d+/)?.[0])).filter(Boolean)
    return actual != null && requested.some((value) => actual >= value)
  }
  const haystack = fields[field] || fields.all
  return values.some((value) => haystack.includes(normalizeText(value)))
}

function findSynonym(token, synonyms) {
  return synonyms.find((synonym) => (synonym.terms || []).map(normalizeText).includes(token))
}

function parseQuery(query, synonyms) {
  const normalized = normalizeText(query)
    .replace(/\b(12|24|220)\s+v\b/g, '$1v')
    .replace(/\bip\s+(\d{2})\b/g, 'ip$1')
    .replace(/\bcri\s+(\d{2})\b/g, 'cri$1')
    .replace(/\b(2700|3000|4000|5000|6000)\s+k\b/g, '$1k')
  const technical = []
  const ignored = new Set()
  const addTechnical = (type, value) => technical.push({ type, value })
  const tokens = normalized.split(' ').filter(Boolean)

  tokens.forEach((token, index) => {
    const voltage = token.match(/^(12|24|220)v$/)
    const ip = token.match(/^ip(\d{2})$/)
    const cri = token.match(/^cri(\d{2})$/)
    const temperature = token.match(/^(2700|3000|4000|5000|6000)k$/)
    if (voltage) { addTechnical('voltage', Number(voltage[1])); ignored.add(index); return }
    if (ip) { addTechnical('ip', Number(ip[1])); ignored.add(index); return }
    if (cri) { addTechnical('cri', Number(cri[1])); ignored.add(index); return }
    if (temperature) { technical.push({ type: 'temperature', values: [temperature[0]] }); ignored.add(index); return }
    const synonym = findSynonym(token, synonyms)
    if (synonym) { technical.push({ type: 'synonym', field: synonym.field || 'all', values: synonym.values || [] }); ignored.add(index) }
  })

  return { normalized, tokens: tokens.filter((_, index) => !ignored.has(index)), technical }
}

function tokenMatches(text, token) {
  if (text.split(' ').some((word) => word === token || word.includes(token))) return true
  if (token.length < 4) return false
  return text.split(' ').some((word) => {
    if (Math.abs(word.length - token.length) > 1) return false
    let differences = 0
    for (let index = 0; index < Math.max(word.length, token.length); index += 1) if (word[index] !== token[index]) differences += 1
    return differences <= 1
  })
}

export function searchProducts(products, query, options = {}) {
  const synonyms = options.synonyms || DEFAULT_SEARCH_SYNONYMS
  const parsed = parseQuery(query, synonyms)
  if (!parsed.normalized) return []

  const exactReference = products.filter((product) => normalizeText(product.ref) === parsed.normalized)
  if (exactReference.length) return exactReference

  return products.map((product) => {
    const fields = fieldText(product)
    if (!parsed.technical.every((condition) => condition.type === 'synonym'
      ? matchesValue(fields, condition.field, condition.values)
      : matchesTechnicalCondition(fields, condition))) return null
    if (!parsed.tokens.every((token) => tokenMatches(fields.all, token))) return null

    let score = 0
    if (fields.name === parsed.normalized) score += 1000
    else if (fields.name.includes(parsed.normalized)) score += 700
    if (fields.ref.includes(parsed.normalized)) score += 600
    if (fields.category.includes(parsed.normalized)) score += 500
    if (parsed.technical.length) score += 300
    if (parsed.tokens.every((token) => tokenMatches(fields.category, token))) score += 100
    if (parsed.tokens.every((token) => tokenMatches(fields.technical, token))) score += 70
    if (parsed.tokens.every((token) => tokenMatches(fields.application, token))) score += 40
    if (fields.all.includes(parsed.normalized)) score += 20
    return { product, score }
  }).filter(Boolean).sort((a, b) => b.score - a.score).map(({ product }) => product)
}

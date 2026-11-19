const clean = (value) => String(value == null ? '' : value).trim()

const labelKey = (label) => clean(label).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const fieldLabels = {
  temperature: 'Temperatura de color',
  ip: 'Protección IP',
  finish: 'Acabado',
  dimensions: 'Dimensiones',
}

const rgbChannel = (value) => /^(?:r(?:ed|ojo)?|g(?:reen|reen)?|v(?:erde)?|b(?:lue|lue)?|azul)$/i.test(clean(value))
const productHasRgb = (product) => {
  const info = product?.technicalInfo || {}
  const text = [product?.name, product?.category, ...(product?.categories || []), info.temperatures, ...(info.codes || []).map((code) => code.temperature)].flat().join(' ')
  return /\brgb\b/i.test(text) || text.split(/[;,\s]+/).filter(Boolean).some(rgbChannel)
}

const normalizeTemperature = (value, isRgb) => {
  const normalized = clean(value)
  if (!isRgb || !normalized) return normalized
  if (rgbChannel(normalized)) return 'RGB'
  return normalized.replace(/\brgb\b/ig, 'RGB')
}

function rowsFromVariant(variant) {
  const rows = Array.isArray(variant.attributes)
    ? variant.attributes
    : Object.entries(variant.attributes || variant.options || variant.specifications || {}).map(([label, value]) => ({ label, value }))
  return rows.map((row) => ({ label: clean(row.label || row.name), value: clean(row.value || row.option) })).filter((row) => row.label && row.value)
}

export function variantCandidates(product) {
  const codes = Array.isArray(product?.technicalInfo?.codes) ? product.technicalInfo.codes : []
  const variants = Array.isArray(product?.variants) ? product.variants : []
  const isRgb = productHasRgb(product)
  const candidates = [
    ...codes.map((code) => ({ ...code, temperature: normalizeTemperature(code.temperature || code.cct, isRgb), reference: clean(code.code || code.reference || code.ref), rows: Object.entries(fieldLabels).map(([key, label]) => ({ label, value: key === 'temperature' ? normalizeTemperature(code[key] || code.cct, isRgb) : clean(code[key]) })).filter((row) => row.value) })),
    ...variants.map((variant) => ({ ...variant, reference: clean(variant.reference || variant.ref || variant.code), rows: rowsFromVariant(variant).map((row) => ({ ...row, value: labelKey(row.label).includes('temperatura') ? normalizeTemperature(row.value, isRgb) : row.value })) })),
  ].filter((variant) => variant.reference)
  return candidates.filter((variant, index, values) => values.findIndex((candidate) => candidate.reference === variant.reference) === index)
}

export function variantValue(variant, label) {
  const key = labelKey(label)
  const row = (variant?.rows || []).find((candidate) => labelKey(candidate.label) === key || labelKey(candidate.label).includes(key) || key.includes(labelKey(candidate.label)))
  return row?.value || ''
}

export function variantLabelRows(variant) {
  return (variant?.rows || []).filter((row) => row.label && row.value)
}

export function variantGroups(candidates) {
  const rows = candidates.flatMap((candidate) => candidate.rows || [])
  return [...new Map(rows.map((row) => [labelKey(row.label), row.label])).values()].map((label) => ({
    label,
    key: labelKey(label),
    values: [...new Set(candidates.map((candidate) => variantValue(candidate, label)).filter(Boolean))],
  })).filter((group) => group.values.length > 1)
}

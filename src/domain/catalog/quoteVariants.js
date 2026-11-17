const clean = (value) => String(value == null ? '' : value).trim()

const labelKey = (label) => clean(label).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const fieldLabels = {
  temperature: 'Temperatura de color',
  ip: 'Protección IP',
  finish: 'Acabado',
  dimensions: 'Dimensiones',
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
  const candidates = [
    ...codes.map((code) => ({ ...code, reference: clean(code.code || code.reference || code.ref), rows: Object.entries(fieldLabels).map(([key, label]) => ({ label, value: clean(code[key]) })).filter((row) => row.value) })),
    ...variants.map((variant) => ({ ...variant, reference: clean(variant.reference || variant.ref || variant.code), rows: rowsFromVariant(variant) })),
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

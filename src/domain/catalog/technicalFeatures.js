export const technicalFeatureGroups = [
  { label: 'Dimensiones', options: [['length', 'Longitud'], ['width', 'Anchura'], ['height', 'Altura'], ['diameter', 'Diámetro'], ['dimensions', 'Dimensiones'], ['cutout', 'Diámetro de corte']] },
  { label: 'Electricidad', options: [['voltage', 'Tensión'], ['power', 'Potencia'], ['current', 'Intensidad'], ['frequency', 'Frecuencia']] },
  { label: 'Luz', options: [['luminousFlux', 'Flujo luminoso'], ['efficacy', 'Eficacia'], ['cri', 'CRI'], ['cct', 'Temperatura de color'], ['beamAngle', 'Ángulo de apertura'], ['ledDensity', 'Densidad LED']] },
  { label: 'Protección', options: [['ip', 'IP'], ['ik', 'IK']] },
  { label: 'Instalación', options: [['mounting', 'Tipo de montaje'], ['cutLength', 'Distancia de corte'], ['suspension', 'Suspensión']] },
  { label: 'Materiales', options: [['material', 'Material'], ['finish', 'Acabado'], ['diffuser', 'Difusor']] },
  { label: 'Control', options: [['dimming', 'Regulación'], ['dali', 'DALI'], ['control', 'Sistema de control']] },
  { label: 'Otros', options: [['lifetime', 'Vida útil'], ['warranty', 'Garantía'], ['operatingTemperature', 'Temperatura de trabajo'], ['other', 'Otro']] },
]

const aliases = [
  ['voltage', ['voltaje', 'tension', 'tensión', 'tensión de alimentación', 'voltage']],
  ['power', ['potencia', 'potencia nominal', 'consumo', 'power']],
  ['luminousFlux', ['flujo', 'flujo luminoso', 'lumen', 'lúmenes', 'luminous']],
  ['cct', ['temperatura de color', 'cct']],
  ['ip', ['protección', 'grado de protección', 'ip']],
  ['beamAngle', ['ángulo', 'angulo', 'ángulo de apertura', 'ángulo de haz', 'beam']],
  ['lifetime', ['vida', 'vida útil', 'horas de vida', 'lifetime']],
  ['length', ['longitud', 'largo']],
  ['width', ['anchura', 'ancho']],
  ['height', ['altura']],
  ['diameter', ['diámetro', 'diametro']],
  ['dimensions', ['dimensión', 'dimensiones', 'dimension']],
  ['cri', ['cri', 'índice cromático', 'indice cromatico']],
  ['mounting', ['montaje', 'tipo de montaje', 'instalación', 'instalacion']],
  ['material', ['material']],
  ['finish', ['acabado', 'finish']],
  ['diffuser', ['difusor']],
  ['dimming', ['regulación', 'regulacion', 'dimming']],
  ['dali', ['dali']],
  ['frequency', ['frecuencia']],
  ['current', ['intensidad', 'corriente']],
  ['efficacy', ['eficacia']],
  ['ledDensity', ['densidad led', 'leds/m', 'leds por metro']],
  ['ik', ['ik', 'impacto']],
  ['cutLength', ['distancia de corte', 'corte']],
  ['suspension', ['suspensión', 'suspension']],
  ['operatingTemperature', ['temperatura de trabajo', 'temperatura operativa']],
]

const normalize = (value) => String(value || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export function resolveTechnicalKey(row = {}) {
  const explicit = String(row.technicalKey || row.featureType || '').trim().toLowerCase()
  const explicitOption = technicalFeatureGroups.flatMap((group) => group.options).find(([key]) => key.toLowerCase() === explicit)
  if (explicitOption) return explicitOption[0]
  const label = normalize(row.label)
  return aliases.find(([, terms]) => terms.some((term) => label === normalize(term) || label.includes(normalize(term))))?.[0] || 'other'
}

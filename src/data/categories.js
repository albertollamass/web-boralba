export const categories = [
  {
    slug: 'tiras-led-2',
    name: 'Tiras LED',
    tagline: 'Iluminación flexible y eficiente para cualquier proyecto',
    description:
      'Tiras LED de alto rendimiento para iluminación decorativa, arquitectónica y profesional.',
    image: 'images/tiras-led.png',
    parent: 'productos',
    children: ['tiras-led', 'tiras-220v', 'tiras-neon'],
  },
  {
    slug: 'tiras-led',
    name: 'Tiras LED 24V',
    tagline: 'Mayor estabilidad para instalaciones de iluminación exigentes',
    description:
      'Ofrecen una iluminación más estable y eficiente, especialmente en instalaciones largas, reduciendo caídas de tensión y manteniendo una luz uniforme a lo largo de toda la tira.',
    image: 'images/cri80.png',
    parent: 'tiras-led-2',
    children: [
      'tiras-led-cri-80',
      'cri-90-iluminacion-led',
      'tira-led-cob-cri-90',
      'monocolor',
      'rgb-y-rgb-cob',
      'tira-led-cct',
    ],
  },
  {
    slug: 'tiras-led-cri-80',
    name: 'CRI80',
    tagline: 'Iluminación eficiente con reproducción de color fiable',
    description:
      'Tiras LED CRI80 que ofrecen luz uniforme y colores naturales, ideales para crear ambientes modernos, eficientes y agradables.',
    image: 'images/cri80.png',
    parent: 'tiras-led',
  },
  {
    slug: 'cri-90-iluminacion-led',
    name: 'CRI90',
    tagline: 'Colores más fieles y luz de mayor calidad',
    description:
      'Las tiras LED CRI90 ofrecen una reproducción de color alta y más precisa, resaltando mejor los tonos reales de los objetos. Ideales para espacios donde la calidad de la luz y la fidelidad del color son importantes.',
    image: 'images/cri90.webp',
    parent: 'tiras-led',
  },
  {
    slug: 'tira-led-cob-cri-90',
    name: 'COB CRI90',
    tagline: 'Luz continua y colores fieles',
    description:
      'Proporcionan una línea de luz uniforme sin puntos visibles y una alta fidelidad de color, ideales para iluminación decorativa y profesional donde se busca un acabado limpio y natural.',
    image: 'images/cob-cri90.webp',
    parent: 'tiras-led',
  },
  {
    slug: 'monocolor',
    name: 'Monocolor',
    tagline: 'Color intenso y uniforme (Rojo, Verde, Azul, Amarillo)',
    description:
      'Tiras LED monocolor de color intenso y uniforme, ideales para proyectos de iluminación extensos y continuos.',
    image: 'images/monocolor.webp',
    parent: 'tiras-led',
  },
  {
    slug: 'rgb-y-rgb-cob',
    name: 'RGB y RGB COB',
    tagline: 'Color dinámico con tecnologías de iluminación',
    description:
      'Permiten crear iluminación multicolor combinando rojo, verde y azul. Mientras que RGB ofrece efectos de color versátiles, RGB COB proporciona además una línea de luz continua y más uniforme, sin puntos LED visibles.',
    image: 'images/rgb.webp',
    parent: 'tiras-led',
  },
  {
    slug: 'tira-led-cct',
    name: 'CCT',
    tagline: 'Ajusta la temperatura de color según cada ambiente',
    description:
      'Permiten cambiar entre blanco cálido y blanco frío, ajustando la temperatura de color según la necesidad del espacio.',
    image: 'images/cct.webp',
    parent: 'tiras-led',
  },
  {
    slug: 'tiras-220v',
    name: 'Tiras 220V',
    tagline: 'Iluminación directa a la red para grandes instalaciones',
    description:
      'Funcionan conectadas directamente a la red eléctrica, permitiendo instalaciones largas sin necesidad de fuente de alimentación.',
    image: 'images/cri80.png',
    parent: 'tiras-led-2',
    children: ['cri-80-2', 'cri-90-2'],
  },
  {
    slug: 'cri-80-2',
    name: 'CRI 80',
    tagline: 'Iluminación eficiente con reproducción de color fiable',
    description:
      'Tiras LED de red 220V con reproducción de color CRI 80 para grandes instalaciones.',
    image: 'images/cri80.png',
    parent: 'tiras-220v',
  },
  {
    slug: 'cri-90-2',
    name: 'CRI 90',
    tagline: 'Colores más fieles y luz de mayor calidad',
    description:
      'Tiras LED de red 220V con reproducción de color CRI 90 para espacios donde la fidelidad del color es importante.',
    image: 'images/cri90.webp',
    parent: 'tiras-220v',
  },
  {
    slug: 'tiras-neon',
    name: 'Tiras Neón',
    tagline: 'Iluminación flexible con efecto neón continuo',
    description:
      'Las tiras Neón Flex ofrecen una línea de luz uniforme y difusa, similar al neón tradicional, pero con tecnología LED más eficiente y flexible.',
    image: 'images/neon.png',
    parent: 'tiras-led-2',
    children: ['flex', 'rgb'],
  },
  {
    slug: 'flex',
    name: 'Flex',
    tagline: 'Neón flexible de línea de luz uniforme',
    description:
      'Tiras de neón flex con efecto neón continuo, ideales para decoración, señalización y diseños creativos.',
    image: 'images/neon.png',
    parent: 'tiras-neon',
  },
  {
    slug: 'rgb',
    name: 'RGB',
    tagline: 'Neón flexible multicolor',
    description:
      'Tiras de neón flex RGB para crear iluminación multicolor con efecto neón continuo.',
    image: 'images/rgb.webp',
    parent: 'tiras-neon',
  },
  {
    slug: 'perfiles',
    name: 'Perfiles',
    tagline: 'Perfiles de aluminio para tiras LED',
    description:
      'Perfiles de aluminio que combinan con las tiras LED para un acabado profesional: disipan el calor y protegen la instalación.',
    image: 'images/perfiles.png',
    parent: 'productos',
    children: [
      'superficie',
      'empotrar',
      'colgante',
      'esquina',
      'tecnico',
      'sencillo',
      'flexible',
      'neon',
    ],
  },
  {
    slug: 'superficie',
    name: 'Superficie',
    tagline: 'Perfiles para instalación en superficie',
    description: 'Perfiles de aluminio diseñados para montaje en superficie.',
    image: 'images/perfiles.png',
    parent: 'perfiles',
  },
  {
    slug: 'empotrar',
    name: 'Empotrar',
    tagline: 'Perfiles para instalación empotrada',
    description: 'Perfiles de aluminio para empotrar en pared o techo.',
    image: 'images/perfiles.png',
    parent: 'perfiles',
  },
  {
    slug: 'colgante',
    name: 'Colgante',
    tagline: 'Perfiles colgantes',
    description: 'Perfiles de aluminio para instalaciones colgantes.',
    image: 'images/perfiles.png',
    parent: 'perfiles',
  },
  {
    slug: 'esquina',
    name: 'Esquina',
    tagline: 'Perfiles de esquina',
    description: 'Perfiles de aluminio diseñados para instalaciones en esquina.',
    image: 'images/perfiles.png',
    parent: 'perfiles',
  },
  {
    slug: 'tecnico',
    name: 'Técnico',
    tagline: 'Perfiles técnicos',
    description: 'Perfiles técnicos de aluminio para instalaciones profesionales.',
    image: 'images/perfiles.png',
    parent: 'perfiles',
  },
  {
    slug: 'sencillo',
    name: 'Sencillo',
    tagline: 'Perfiles sencillos',
    description: 'Perfiles sencillos de aluminio de montaje rápido.',
    image: 'images/perfiles.png',
    parent: 'perfiles',
  },
  {
    slug: 'flexible',
    name: 'Flexible',
    tagline: 'Perfiles flexibles',
    description: 'Perfiles flexibles para instalaciones curvas y creativas.',
    image: 'images/perfiles.png',
    parent: 'perfiles',
  },
  {
    slug: 'neon',
    name: 'Neón',
    tagline: 'Perfiles para neón LED',
    description: 'Perfiles específicos para instalaciones de tiras de neón LED.',
    image: 'images/neon.png',
    parent: 'perfiles',
  },
  {
    slug: 'controladores-y-fuentes',
    name: 'Fuentes y Drivers',
    tagline: 'Controladores y fuentes de alimentación LED',
    description:
      'Fuentes de alimentación y controladores para alimentar y regular la iluminación LED de forma segura.',
    image: 'images/fuentes-drivers.png',
    parent: 'productos',
    children: ['ip20-clase-ii', 'ip67'],
  },
  {
    slug: 'ip20-clase-ii',
    name: 'IP20 / Clase II',
    tagline: 'Fuentes y controladores para interior',
    description: 'Controladores para interior con protección IP20 y aislamiento Clase II.',
    image: 'images/fuentes-drivers.png',
    parent: 'controladores-y-fuentes',
    children: ['normal-ip20', 'dali-ip20', 'casambi', 'matter'],
  },
  {
    slug: 'normal-ip20',
    name: 'Normal IP20',
    tagline: 'Controladores IP20 de serie',
    description: 'Controladores IP20 estándar para instalaciones de interior.',
    image: 'images/fuentes-drivers.png',
    parent: 'ip20-clase-ii',
  },
  {
    slug: 'dali-ip20',
    name: 'DALI IP20',
    tagline: 'Controladores DALI para interior',
    description: 'Controladores con protocolo DALI para control de iluminación en interior.',
    image: 'images/fuentes-drivers.png',
    parent: 'ip20-clase-ii',
  },
  {
    slug: 'casambi',
    name: 'Casambi',
    tagline: 'Control inalámbrico Casambi',
    description: 'Controladores compatibles con el ecosistema inalámbrico Casambi.',
    image: 'images/fuentes-drivers.png',
    parent: 'ip20-clase-ii',
  },
  {
    slug: 'matter',
    name: 'Matter',
    tagline: 'Controladores compatibles con Matter',
    description: 'Controladores compatibles con el estándar Matter para hogar conectado.',
    image: 'images/fuentes-drivers.png',
    parent: 'ip20-clase-ii',
  },
  {
    slug: 'ip67',
    name: 'IP67',
    tagline: 'Fuentes y controladores estancos',
    description: 'Fuentes de alimentación estancas IP67 para exterior y zonas húmedas.',
    image: 'images/fuentes-drivers.png',
    parent: 'controladores-y-fuentes',
    children: ['normal-ip67', 'dali-ip67'],
  },
  {
    slug: 'normal-ip67',
    name: 'Normal IP67',
    tagline: 'Controladores estancos de serie',
    description: 'Fuentes IP67 estándar para instalaciones en exterior.',
    image: 'images/fuentes-drivers.png',
    parent: 'ip67',
  },
  {
    slug: 'dali-ip67',
    name: 'DALI IP67',
    tagline: 'Controladores estancos DALI',
    description: 'Fuentes IP67 con protocolo DALI para exterior.',
    image: 'images/fuentes-drivers.png',
    parent: 'ip67',
  },
  {
    slug: 'proyectores',
    name: 'Proyectores',
    tagline: 'Proyectores LED profesionales',
    description: 'Proyectores LED de exterior e interior para iluminación de acento y seguridad.',
    image: 'images/proyectores.png',
    parent: 'productos',
  },
  {
    slug: 'downlight-led',
    name: 'Downlight LED',
    tagline: 'Downlights LED de alto rendimiento',
    description: 'Downlights empotrables LED para iluminación general con gran eficiencia.',
    image: 'images/downlight.png',
    parent: 'productos',
  },
  {
    slug: 'panel-led',
    name: 'Panel LED',
    tagline: 'Paneles LED planos',
    description: 'Paneles LED de techo con luz uniforme y diseño fino, ideales para oficinas.',
    image: 'images/panel-led.png',
    parent: 'productos',
  },
  {
    slug: 'apliques',
    name: 'Apliques',
    tagline: 'Apliques de pared LED',
    description: 'Apliques LED de pared para iluminación decorativa y funcional.',
    image: 'images/apliques.png',
    parent: 'productos',
  },
  {
    slug: 'pantalla-estanca',
    name: 'Pantalla Estanca',
    tagline: 'Pantallas estancas LED',
    description: 'Pantallas estancas LED para naves, garajes y zonas industriales.',
    image: 'images/pantalla-estanca.png',
    parent: 'productos',
  },
]

export const ROOT = {
  slug: 'productos',
  name: 'Productos',
  children: [
    'tiras-led-2',
    'perfiles',
    'controladores-y-fuentes',
    'proyectores',
    'downlight-led',
    'panel-led',
    'apliques',
    'pantalla-estanca',
  ],
}

const bySlug = Object.fromEntries(categories.map((c) => [c.slug, c]))

export function getCategory(slug) {
  return bySlug[slug]
}

export function getChildren(slug) {
  const cat = slug === ROOT.slug ? ROOT : bySlug[slug]
  if (!cat || !cat.children) return []
  return cat.children.map((s) => bySlug[s]).filter(Boolean)
}

export function getBreadcrumb(slug) {
  const trail = []
  let current = bySlug[slug]
  while (current) {
    trail.unshift(current)
    current = bySlug[current.parent]
  }
  return trail
}

export function getCategoryPathLabel(slug) {
  return getBreadcrumb(slug)
    .map((c) => c.name)
    .join(' › ')
}

export function getLeafCategories() {
  return categories.filter((c) => !c.children || c.children.length === 0)
}

export function getDescendantSlugs(slug) {
  const result = [slug]
  const visit = (s) => {
    const cat = bySlug[s]
    if (cat && cat.children) {
      cat.children.forEach((child) => {
        result.push(child)
        visit(child)
      })
    }
  }
  visit(slug)
  return result
}

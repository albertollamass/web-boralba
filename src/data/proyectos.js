const BASE = `${import.meta.env.BASE_URL}images/proyectos/`

export const PROJECT_CATEGORIES = [
  {
    slug: 'salud-y-bienestar',
    name: 'Salud y bienestar',
    tagline: 'Luz que cuida: confort visual para espacios asistenciales y de bienestar.',
    intro: 'Espacios asistenciales y de bienestar donde la iluminación aporta calma, confort visual y un ambiente acogedor.',
    image: `${BASE}centro_medico_1.jpg`,
  },
  {
    slug: 'oficinas-y-espacios-de-trabajo',
    name: 'Oficinas y espacios de trabajo',
    tagline: 'Iluminación equilibrada que cuida el bienestar y la efectividad en el trabajo.',
    intro: 'Espacios de trabajo con una iluminación uniforme y confortable, pensada para quien los utiliza cada día.',
    image: `${BASE}oficinas.jpg`,
  },
  {
    slug: 'comercios-y-hosteleria',
    name: 'Comercios y hostelería',
    tagline: 'La luz como herramienta de marca, producto y atmósfera.',
    intro: 'Comercios, hoteles y espacios de restauración donde la iluminación define el recorrido, presenta el producto y crea ambiente.',
    image: `${BASE}Madrid-Sur1.jpg`,
  },
  {
    slug: 'soluciones-especiales',
    name: 'Soluciones especiales',
    tagline: 'Proyectos donde la luz se integra en la propia arquitectura.',
    intro: 'Intervenciones a medida en las que la iluminación forma parte del proyecto, poniendo en escena volumen, material y lugar.',
    image: `${BASE}obra_panel_led.png`,
  },
  {
    slug: 'espacios-publicos-y-educativos',
    name: 'Espacios públicos y educativos',
    tagline: 'La luz al servicio de la cultura, la ciudad y quienes la habitan.',
    intro: 'Equipamientos culturales, educativos y espacios públicos donde la iluminación aporta identidad, seguridad y presencia al entorno urbano.',
    image: `${BASE}centro_cultural_antonio_lopez_1.jpg`,
  },
  {
    slug: 'exterior-y-fachadas',
    name: 'Exterior y fachadas',
    tagline: 'La arquitectura exterior puesta en escena con luz.',
    intro: 'Iluminación de exteriores y fachadas que realza la arquitectura y acompaña el entorno durante la noche.',
    image: `${BASE}torre_consuerga_home.png`,
  },
  {
    slug: 'viviendas',
    name: 'Viviendas',
    tagline: 'Luz para habitar: hogares donde la iluminación acompaña el día a día.',
    intro: 'Proyectos de iluminación para viviendas, donde la luz se diseña para acompañar cada momento y realzar la arquitectura interior.',
    image: `${BASE}chalet_pozuelo.png`,
  },
]

const elProyecto = {
  'hotel-rural-torre-de-consuegra':
    'Hotel rural situado junto a la emblemática Torre de Consuegra. Un proyecto donde la iluminación interior debía dialogar con el carácter histórico del edificio y acompañar la experiencia de la estancia.',
  'tunel-calle-damas':
    'Intervención de iluminación en un paso urbano, en la que la luz transforma un espacio de tránsito en un elemento reconocible y atractivo de la ciudad.',
  'centro-medico':
    'Espacio asistencial donde la iluminación debía responder a los requerimientos de una clínica sin renunciar a un ambiente sereno y acogedor.',
  'centro-cultural-antonio-lopez':
    'Equipamiento cultural donde la identidad luminosa del espacio participa de la imagen pública de la institución.',
  'centro-comercial-madrid-sur':
    'Gran espacio comercial donde la iluminación acompaña el recorrido del visitante y refuerza la presencia de las marcas.',
  'hotel-jc-santo-domingo':
    'Hotel en pleno centro de la ciudad donde la iluminación debía aportar calidez y carácter a la recepción y a las zonas comunes.',
  'obra-panel-led-flexible':
    'Aplicación de paneles LED de formato flexible dentro del proyecto de una obra, integrando la luz en la propia arquitectura.',
  'chalet-en-pozuelo-de-alarcon':
    'Vivienda unifamiliar donde la iluminación se diseña para acompañar el día a día de la casa y realzar cada espacio del hogar.',
  'torre-consuegra-iluminacion-monumental':
    'Iluminación exterior de la Torre de Consuegra, poniendo en valor un elemento arquitectónico singular durante la noche.',
}

const laSolucion = {
  'hotel-rural-torre-de-consuegra':
    'Se emplearon bañadores de pared para iluminar los paramentos y crear una luz ambiental envolvente, combinando confort visual con un resultado sobrio y atemporal.',
  'tunel-calle-damas':
    'Bañadores de pared distribuidos a lo largo del recorrido para lograr una luz equilibrada, con la posibilidad de variar el ambiente mediante color cuando la instalación lo requiere.',
  'centro-medico':
    'Tiras LED alojadas en perfiles permitieron una integración limpia en el techo y líneas de luz continuas, uniformes y confortables para el trabajo asistencial.',
  'centro-cultural-antonio-lopez':
    'Neón flex LED para crear trazos y letreros luminosos a medida, aportando presencia y carácter a la señalización del equipamiento cultural.',
  'centro-comercial-madrid-sur':
    'Bañadores de pared para iluminar amplias superficies de forma uniforme y eficiente, manteniendo un ambiente luminoso y despejado en las zonas de gran altura.',
  'hotel-jc-santo-domingo':
    'Bañadores de pared seleccionados para crear una luz suave y uniforme en los paramentos, favoreciendo un ambiente elegante y relajado en las zonas comunes.',
  'obra-panel-led-flexible':
    'Paneles LED flexibles adaptados a la geometría del espacio, permitiendo cubrir superficies con una luz continua y homogénea integrada en el diseño.',
  'chalet-en-pozuelo-de-alarcon':
    'Diseño de luz orientado a crear ambientes cálidos y funcionales, integrando la iluminación de forma discreta en la arquitectura interior de la vivienda.',
  'torre-consuegra-iluminacion-monumental':
    'Puesta en escena de la arquitectura mediante luz exterior, acentuando la volumetría y la textura del monumento durante la noche.',
}

const iluminacion = {
  'hotel-rural-torre-de-consuegra':
    'Bañadores de pared como protagonistas, con una luz cálida orientada a generar ambientes acogedores en las zonas de descanso y de relación.',
  'tunel-calle-damas':
    'Bañadores de pared de pequeño formato integrados en el revestimiento, con luz ambiental y secuencias de color.',
  'centro-medico':
    'Tiras LED y perfiles para la iluminación general y de apoyo, con una luz neutra y uniforme adaptada al uso del espacio.',
  'centro-cultural-antonio-lopez':
    'Neón flex LED flexible para rotulación y detalles luminosos lineales.',
  'centro-comercial-madrid-sur':
    'Bañadores de pared para la iluminación general, con una buena uniformidad en espacios de gran altura.',
  'hotel-jc-santo-domingo':
    'Bañadores de pared para ambientar las zonas comunes con luz cálida y uniforme.',
  'obra-panel-led-flexible':
    'Paneles LED flexibles para crear superficies luminosas a medida dentro de la obra.',
  'chalet-en-pozuelo-de-alarcon':
    'Solución a medida para cada estancia, combinando luz general y luz de acento.',
  'torre-consuegra-iluminacion-monumental':
    'Iluminación exterior de acento para arquitectura monumental.',
}

const control = {
  'hotel-rural-torre-de-consuegra':
    'Configuración y puesta en marcha de la instalación con soluciones de control integradas.',
  'tunel-calle-damas':
    'Programación y puesta en marcha del sistema, incluyendo la gestión de las escenas de color.',
  'centro-medico':
    'Puesta en marcha y ajuste de los niveles de iluminación según las necesidades de cada zona.',
  'centro-cultural-antonio-lopez':
    'Gestión del encendido y puesta en marcha de la instalación luminosa.',
  'centro-comercial-madrid-sur':
    'Configuración y puesta en marcha del sistema de iluminación del centro.',
  'hotel-jc-santo-domingo':
    'Ajuste y puesta en marcha de la solución de iluminación.',
  'torre-consuegra-iluminacion-monumental':
    'Programación y puesta en marcha de la iluminación exterior del monumento.',
}

export const PROJECTS = [
  {
    slug: 'hotel-rural-torre-de-consuegra',
    name: 'Hotel Rural Torre de Consuegra',
    location: 'Consuegra, Toledo',
    category: 'comercios-y-hosteleria',
    type: 'Bañadores de pared',
    intro: 'Luz cálida que dialoga con el carácter histórico de la estancia.',
    images: [
      `${BASE}torre_consuerga_1.jpg`,
      `${BASE}torre_consuerga_4.jpg`,
      `${BASE}torre_consuerga_2.jpg`,
    ],
    year: null,
    productos: ['Bañadores de pared'],
    elProyecto: elProyecto['hotel-rural-torre-de-consuegra'],
    laSolucion: laSolucion['hotel-rural-torre-de-consuegra'],
    iluminacion: iluminacion['hotel-rural-torre-de-consuegra'],
    control: control['hotel-rural-torre-de-consuegra'],
  },
  {
    slug: 'tunel-calle-damas',
    name: 'Túnel Calle Damas',
    location: 'Calle Damas',
    category: 'espacios-publicos-y-educativos',
    type: 'Bañadores de pared',
    intro: 'Un paso urbano que se transforma en elemento luminoso.',
    images: [
      `${BASE}tunel_calle_damas_azul.jpg`,
      `${BASE}tunel_calle_damas_2.jpg`,
      `${BASE}tunel_calle_damas_3.jpg`,
    ],
    year: null,
    productos: ['Bañadores de pared'],
    elProyecto: elProyecto['tunel-calle-damas'],
    laSolucion: laSolucion['tunel-calle-damas'],
    iluminacion: iluminacion['tunel-calle-damas'],
    control: control['tunel-calle-damas'],
  },
  {
    slug: 'centro-medico',
    name: 'Centro Médico',
    location: '',
    category: 'salud-y-bienestar',
    type: 'Tiras LED y perfiles',
    intro: 'Líneas de luz integradas para un ambiente asistencial uniforme y confortable.',
    images: [
      `${BASE}centro_medico_3.jpg`,
      `${BASE}centro_medico_2.jpg`,
      `${BASE}centro_medico_1.jpg`,
    ],
    year: null,
    productos: ['Tiras LED', 'Perfiles'],
    elProyecto: elProyecto['centro-medico'],
    laSolucion: laSolucion['centro-medico'],
    iluminacion: iluminacion['centro-medico'],
    control: control['centro-medico'],
  },
  {
    slug: 'centro-cultural-antonio-lopez',
    name: 'Centro Cultural Antonio López',
    location: '',
    category: 'espacios-publicos-y-educativos',
    type: 'Neón flex LED',
    intro: 'Neón flex LED que firma la identidad luminosa del equipamiento.',
    images: [
      `${BASE}centro_cultural_antonio_lopez_1.jpg`,
      `${BASE}centro_cultural_antonio_lopez_3.jpg`,
      `${BASE}centro_cultural_antonio_lopez_2.jpg`,
    ],
    year: null,
    productos: ['Neón flex LED'],
    elProyecto: elProyecto['centro-cultural-antonio-lopez'],
    laSolucion: laSolucion['centro-cultural-antonio-lopez'],
    iluminacion: iluminacion['centro-cultural-antonio-lopez'],
    control: control['centro-cultural-antonio-lopez'],
  },
  {
    slug: 'centro-comercial-madrid-sur',
    name: 'Centro Comercial Madrid Sur',
    location: 'Madrid',
    category: 'comercios-y-hosteleria',
    type: 'Bañadores de pared',
    intro: 'Luz uniforme y eficiente para un gran espacio de tránsito.',
    images: [
      `${BASE}Madrid-Sur_2.jpg`,
      `${BASE}Madrid-Sur1.jpg`,
      `${BASE}Madrid-Sur_3.jpg`,
    ],
    year: null,
    productos: ['Bañadores de pared'],
    elProyecto: elProyecto['centro-comercial-madrid-sur'],
    laSolucion: laSolucion['centro-comercial-madrid-sur'],
    iluminacion: iluminacion['centro-comercial-madrid-sur'],
    control: control['centro-comercial-madrid-sur'],
  },
  {
    slug: 'hotel-jc-santo-domingo',
    name: 'Hotel JC Santo Domingo',
    location: 'A Coruña',
    category: 'comercios-y-hosteleria',
    type: 'Bañadores de pared',
    intro: 'Bañadores de pared para unas zonas comunes cálidas y elegantes.',
    images: [
      `${BASE}jc-santo-domingo-1.jpg`,
    ],
    year: null,
    productos: ['Bañadores de pared'],
    elProyecto: elProyecto['hotel-jc-santo-domingo'],
    laSolucion: laSolucion['hotel-jc-santo-domingo'],
    iluminacion: iluminacion['hotel-jc-santo-domingo'],
    control: control['hotel-jc-santo-domingo'],
  },
  {
    slug: 'obra-panel-led-flexible',
    name: 'Obra con panel LED flexible',
    location: '',
    category: 'soluciones-especiales',
    type: 'Paneles LED flexibles',
    intro: 'Paneles LED flexibles integrados en la arquitectura de la obra.',
    images: [
      `${BASE}obra_panel_led.png`,
    ],
    year: null,
    productos: ['Paneles LED flexibles'],
    elProyecto: elProyecto['obra-panel-led-flexible'],
    laSolucion: laSolucion['obra-panel-led-flexible'],
    iluminacion: iluminacion['obra-panel-led-flexible'],
    control: null,
  },
  {
    slug: 'chalet-en-pozuelo-de-alarcon',
    name: 'Chalet en Pozuelo de Alarcón',
    location: 'Pozuelo de Alarcón, Madrid',
    category: 'viviendas',
    type: '',
    intro: 'Iluminación cálida y funcional para el día a día del hogar.',
    images: [
      `${BASE}chalet_pozuelo.png`,
    ],
    year: null,
    productos: [],
    elProyecto: elProyecto['chalet-en-pozuelo-de-alarcon'],
    laSolucion: laSolucion['chalet-en-pozuelo-de-alarcon'],
    iluminacion: iluminacion['chalet-en-pozuelo-de-alarcon'],
    control: null,
  },
  {
    slug: 'torre-consuegra-iluminacion-monumental',
    name: 'Torre Consuegra',
    location: 'Consuegra, Toledo',
    category: 'exterior-y-fachadas',
    type: 'Iluminación monumental · Arquitectura exterior',
    intro: 'La arquitectura exterior puesta en escena con luz.',
    images: [
      `${BASE}torre_consuerga_home.png`,
      `${BASE}entrada_torre_consuegra.jpg`,
    ],
    year: null,
    productos: [],
    elProyecto: elProyecto['torre-consuegra-iluminacion-monumental'],
    laSolucion: laSolucion['torre-consuegra-iluminacion-monumental'],
    iluminacion: iluminacion['torre-consuegra-iluminacion-monumental'],
    control: control['torre-consuegra-iluminacion-monumental'],
  },
]

export function getProjectCategory(slug) {
  return PROJECT_CATEGORIES.find((category) => category.slug === slug) || null
}

export function getProjectsByCategory(slug) {
  return PROJECTS.filter((project) => project.category === slug)
}

export function getProject(categorySlug, projectSlug) {
  return PROJECTS.find((project) => project.slug === projectSlug && project.category === categorySlug) || null
}

export function findProject(slug) {
  return PROJECTS.find((project) => project.slug === slug) || null
}
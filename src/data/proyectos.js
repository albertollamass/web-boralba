const BASE = `${import.meta.env.BASE_URL}images/proyectos/`
const GYM_BASE = `${import.meta.env.BASE_URL}images/IMAGENES PROYECTOS/SALUD Y BIENESTAR/Gimansio · MADRID/`
const HOSPITAL_BASE = `${import.meta.env.BASE_URL}images/IMAGENES PROYECTOS/SALUD Y BIENESTAR/Hospital Greogorio Marañón Madrid/`

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
  'hotel-jc-santo-domingo-exteriores':
    'Iluminación exterior del Hotel JC Santo Domingo, donde la fachada cobra presencia y carácter durante la noche, convirtiendo el acceso del hotel en un elemento reconocible de la ciudad.',
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
  'hotel-jc-santo-domingo-exteriores':
    'Bañadores de pared orientados a acentuar la volumetría y los materiales de la fachada con un trazo limpio y uniforme, señalizando con luz el acceso del hotel.',
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
  'hotel-jc-santo-domingo-exteriores':
    'Luz de acento en fachada con bañadores de pared, resaltando arquitectura y acceso con una temperatura de color cálida.',
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
  'hotel-jc-santo-domingo-exteriores':
    'Programación y puesta en marcha de la iluminación exterior del hotel.',
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
    slug: 'hospital-gregorio-maranon',
    name: 'Hospital Gregorio Marañón',
    location: 'Madrid',
    category: 'salud-y-bienestar',
    type: 'Iluminación LED asistencial',
    intro: 'Una luz precisa y confortable para acompañar cada espacio del hospital.',
    images: [
      `${HOSPITAL_BASE}Iluminacion en pasillo.png`,
      `${HOSPITAL_BASE}Iluminacion sala.png`,
      `${HOSPITAL_BASE}Iluminación consulta.png`,
      `${HOSPITAL_BASE}Ilumiinacion en cama.png`,
      `${HOSPITAL_BASE}Iluminacion en escritorio.png`,
      `${HOSPITAL_BASE}Iluminación consulta (2).png`,
      `${HOSPITAL_BASE}Iluminacion sala concreta.png`,
      `${HOSPITAL_BASE}Iluminación en cama 2.png`,
      `${HOSPITAL_BASE}Iluminación sala de ordenadores.png`,
      `${HOSPITAL_BASE}Iluminación sala de ordenadores 2.png`,
      `${HOSPITAL_BASE}Iluminación sala de ordenadores 3.png`,
    ],
    year: 2026,
    productos: ['Tiras LED', 'Perfiles', 'Iluminación técnica'],
    elProyecto:
      'La renovación del Hospital Gregorio Marañón en Madrid reúne espacios asistenciales, consultas y áreas de trabajo que necesitan una iluminación clara, fiable y respetuosa con las personas.',
    laSolucion:
      'La propuesta combina líneas LED integradas, iluminación general uniforme y puntos de apoyo específicos para resolver cada uso sin perder continuidad visual entre pasillos, habitaciones y zonas de trabajo.',
    iluminacion:
      'La luz neutra facilita la actividad sanitaria y administrativa, mientras que los niveles controlados y los encendidos lineales reducen deslumbramientos y ayudan a crear una sensación más serena.',
    control:
      'La puesta en marcha permite ajustar cada zona a sus necesidades de uso, manteniendo una instalación eficiente y preparada para el funcionamiento continuo del hospital.',
  },
  {
    slug: 'centro-de-pilates',
    name: 'Centro de Pilates',
    location: 'Madrid',
    category: 'salud-y-bienestar',
    type: '',
    intro: 'Iluminación para el bienestar en movimiento.',
    subtitle: 'Iluminación para el bienestar en movimiento',
    images: [
      `${BASE}pilates_sala_principal.png`,
      `${BASE}pilates_sala.png`,
      `${BASE}pilates_sala_2.png`,
      `${BASE}pilates_entrada.png`,
      `${BASE}pilates_pasillo.png`,
      `${BASE}pilates_pasillo_2.png`,
      `${BASE}pilates_escaleras.png`,
      `${BASE}pilates_bano.png`,
      `${BASE}pilates_garaje.png`,
      `${BASE}pilates_garaje_2.png`,
    ],
    year: 2026,
    productos: [],
    template: 'reportaje',
    portraitCover: true,
    elProyecto: null,
    laSolucion: null,
    iluminacion: null,
    control: null,
  },
  {
    slug: 'gimnasio-madrid',
    name: 'Gimnasio Madrid',
    location: 'Madrid',
    category: 'salud-y-bienestar',
    type: 'Iluminación LED integral',
    intro: 'Una iluminación dinámica para entrenar, concentrarse y recuperar.',
    images: [
      `${GYM_BASE}Iluminacion en pasillo.png`,
      `${GYM_BASE}Ilumiación de banco.png`,
      `${GYM_BASE}Espacio de ciclo 2.png`,
      `${GYM_BASE}Espacio de boxeo.png`,
      `${GYM_BASE}Espacio de ciclo.png`,
      `${GYM_BASE}Espacio ciclo altillo.png`,
      `${GYM_BASE}Espcacio de ciclo luces blancas.png`,
    ],
    year: 2026,
    productos: ['Tiras LED', 'Perfiles', 'Iluminación RGB'],
    elProyecto:
      'El proyecto transforma un gimnasio de Madrid en una experiencia de entrenamiento completa, con una identidad luminosa capaz de adaptarse a cada zona y a cada ritmo de actividad.',
    laSolucion:
      'Se combinan líneas de luz integradas, iluminación ambiental cálida y escenas de color para definir recorridos, reforzar la energía de las salas y mantener el confort visual durante el entrenamiento.',
    iluminacion:
      'La luz blanca y uniforme acompaña las áreas de máquinas y circulación, mientras que los tonos azul, violeta y verde construyen una atmósfera inmersiva en las salas de ciclo y actividades dirigidas.',
    control:
      'La puesta en marcha permite ajustar las escenas según el uso de cada espacio, desde una iluminación funcional para el día a día hasta ambientes más intensos para las sesiones de grupo.',
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
  {
    slug: 'hotel-jc-santo-domingo-exteriores',
    name: 'Hotel JC Santo Domingo',
    location: 'Madrid',
    category: 'exterior-y-fachadas',
    type: 'Iluminación de fachada',
    intro: 'La fachada del hotel puesta en escena con luz.',
    images: [
      `${BASE}hotel_jc_fachada_1.png`,
      `${BASE}hotel_jc_fachada_2.png`,
      `${BASE}hotel_jc_fachada_3.png`,
      `${BASE}hotel_jc_fachada_4.png`,
    ],
    gallery: [
      `${BASE}hotel_jc_fachada_1.png`,
      `${BASE}hotel_jc_fachada_2.png`,
      `${BASE}hotel_jc_fachada_3.png`,
      `${BASE}hotel_jc_fachada_4.png`,
    ],
    year: null,
    productos: ['Bañadores de pared'],
    elProyecto: elProyecto['hotel-jc-santo-domingo-exteriores'],
    laSolucion: laSolucion['hotel-jc-santo-domingo-exteriores'],
    iluminacion: iluminacion['hotel-jc-santo-domingo-exteriores'],
    control: control['hotel-jc-santo-domingo-exteriores'],
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

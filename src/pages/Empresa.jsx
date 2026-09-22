import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import Seo from '../components/Seo'
import { canonicalFor, breadcrumbJsonLd } from '../lib/seo'

const areas = [
  {
    num: '01',
    title: 'Asesoramiento técnico',
    text: 'Analizamos las necesidades del proyecto y proponemos la solución de iluminación más adecuada.',
    img: 'images/asesoramiento.png',
    cap: 'Imagen 01 · trabajo técnico y planificación',
  },
  {
    num: '02',
    title: 'Diseño de iluminación',
    text: 'Definimos la distribución, los niveles de luz y la solución técnica para cada espacio.',
    img: 'images/imagen-3d.png',
    cap: 'Imagen 02 · estudio de luz en 3D',
  },
  {
    num: '03',
    title: 'Suministro profesional',
    text: 'Seleccionamos y suministramos luminarias, componentes y sistemas adaptados a cada proyecto.',
    img: 'images/foto-halopack.png',
    cap: 'Imagen 03 · soluciones LED HALOPACK',
  },
  {
    num: '04',
    title: 'Puesta en marcha',
    text: 'Configuramos, programamos y comprobamos el funcionamiento de los sistemas de iluminación.',
    img: 'images/puesta_en_marcha.png',
    cap: 'Imagen 04 · configuración y entrega del sistema',
  },
]

const virtues = [
  { num: '01', text: 'Conocimiento técnico', size: 'xl', align: 'start' },
  { num: '02', text: 'Atención cercana', size: 'md', align: 'end' },
  { num: '03', text: 'Soluciones a medida', size: 'lg', align: 'start' },
  { num: '04', text: 'Experiencia en proyectos', size: 'sm', align: 'end' },
  { num: '05', text: 'Innovación constante', size: 'lg', align: 'start' },
]

export default function Empresa() {
  return (
    <div className="empresa-editorial">
      <Seo
        title="Empresa — Una forma diferente de entender la luz | Boralba Lighting"
        description="Boralba Lighting: iluminación profesional, asesoramiento técnico, diseño, suministro, control Tridonic, marca propia HALOPACK y puesta en marcha. Desde Getafe, Madrid."
        path="/empresa"
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', url: canonicalFor('/') },
          { name: 'Empresa', url: canonicalFor('/empresa') },
        ])}
      />

      {/* ============ 1 · PORTADA EDITORIAL ============ */}
      <section className="emp-hero">
        <div className="emp-wrap">
          <Reveal>
            <p className="emp-eyebrow">Empresa&nbsp;<span>/</span>&nbsp;Boralba</p>
          </Reveal>
          <div className="emp-hero-grid">
            <div className="emp-hero-copy">
              <Reveal delay={80}>
                <h1>
                  No vendemos solo
                  <br />
                  iluminación.
                  <span className="emp-hero-second">Ayudamos a construir espacios.</span>
                </h1>
              </Reveal>
              <Reveal delay={180}>
                <p className="emp-hero-text">
                  En Boralba entendemos la luz como una parte esencial de cada proyecto.
                  Una herramienta capaz de transformar la arquitectura, mejorar el bienestar
                  y cambiar la forma en la que percibimos un espacio.
                </p>
              </Reveal>
            </div>
            <div className="emp-hero-media">
              <Reveal delay={140} className="emp-hero-media-reveal">
                <figure className="emp-media">
                  <img
                    src="images/imagen-3d.png"
                    alt="Diseño de iluminación arquitectónica proyectado por Boralba"
                    loading="lazy"
                    width="1617"
                    height="973"
                  />
                  <figcaption>
                    <span>Fig. 01</span> Luz proyectada sobre arquitectura y materia
                  </figcaption>
                </figure>
              </Reveal>
            </div>
          </div>
          <Reveal delay={240}>
            <div className="emp-hero-meta">
              <span>Iluminación profesional</span>
              <span>Asesoramiento · Diseño · Suministro</span>
              <span>Getafe, Madrid</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ 2 · INTRODUCCIÓN TIPO ARTÍCULO ============ */}
      <section className="emp-article">
        <div className="emp-wrap">
          <Reveal>
            <div className="emp-article-head">
              <p className="emp-eyebrow">Introducción</p>
              <h2>Una forma diferente de entender la luz</h2>
              <p className="emp-article-byline">
                <span>Artículo 01</span>
                <span>Empresa</span>
                <span>Madrid</span>
              </p>
            </div>
          </Reveal>
          <div className="emp-article-grid">
            <Reveal delay={80}>
              <div className="emp-article-col">
                <p className="emp-drop">
                  La luz ordena un espacio. Define cómo se percibe, cómo se usa y cómo se vive.
                  Por eso cada proyecto de Boralba empieza por una pregunta: qué necesita la luz
                  que haga aquí.
                </p>
                <p>
                  No elegimos una luminaria por catálogo. Estudiamos la arquitectura, el uso y
                  la materialidad del espacio para proponer una solución coherente, reproducible
                  y eficiente desde el primer plano.
                </p>
                <p>
                  La técnica no está reñida con la estética. Una iluminación bien planteada puede
                  ser precisa y notable al mismo tiempo; esa combinación es lo que buscamos en cada
                  instalación.
                </p>
              </div>
            </Reveal>
            <Reveal delay={160}>
              <div className="emp-article-col">
                <p>
                  Acompañamos al arquitecto, al interiorista y al instalador en cada decisión:
                  asesoramiento técnico, diseño de iluminación, suministro profesional y puesta
                  en marcha. El conocimiento técnico llega antes de la primera decisión y se queda
                  hasta que el sistema funciona.
                </p>
                <p>
                  Esa es la diferencia. No entregamos una lista de productos: construimos una
                  solución de iluminación pensada para el espacio, para las personas que lo usan
                  y para el proyecto en su conjunto.
                </p>
                <p className="emp-article-end">
                  <span aria-hidden="true">—</span>
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ 3 · HISTORIA DE BORALBA ============ */}
      <section className="emp-history">
        <div className="emp-wrap">
          <div className="emp-history-grid">
            <Reveal className="emp-history-media">
              <figure className="emp-media">
                <img
                  src="images/almacen.png"
                  alt="Instalaciones de Boralba Lighting en Getafe, Madrid"
                  loading="lazy"
                  width="1828"
                  height="860"
                />
                <figcaption>
                  <span>Fig. 02</span> Instalaciones de Boralba Lighting en Getafe (Madrid)
                </figcaption>
              </figure>
            </Reveal>
            <div className="emp-history-copy">
              <Reveal>
                <p className="emp-eyebrow">Nuestra historia</p>
                <h2>De dónde venimos</h2>
              </Reveal>
              <Reveal delay={80}>
                <p className="emp-history-lead">
                  Boralba comenzó en la distribución y la comercialización de iluminación
                  profesional y evolucionó hacia una compañía de soluciones completas para
                  proyectos: asesoramiento, diseño, control y puesta en marcha.
                </p>
              </Reveal>
              <Reveal delay={140}>
                <div className="emp-history-slot">
                  <span className="emp-history-slot-label">Espacio reservado</span>
                  <p className="emp-history-slot-text">
                    Año de fundación e historia real de la empresa. Este bloque se completará con
                    los datos definitivos de Boralba.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={200}>
                <dl className="emp-data">
                  <div>
                    <dt>Año de fundación</dt>
                    <dd aria-hidden="true">—</dd>
                  </div>
                  <div>
                    <dt>Ubicación</dt>
                    <dd>Getafe, Madrid</dd>
                  </div>
                  <div>
                    <dt>Marca propia</dt>
                    <dd>HALOPACK</dd>
                  </div>
                  <div>
                    <dt>Partner tecnológico</dt>
                    <dd>TRIDONIC</dd>
                  </div>
                </dl>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 4 · NUESTRA MANERA DE TRABAJAR ============ */}
      <section className="emp-work">
        <div className="emp-wrap">
          <Reveal>
            <div className="emp-work-head">
              <p className="emp-eyebrow">Cómo trabajamos</p>
              <h2>La técnica al servicio de cada proyecto</h2>
              <p className="emp-work-intro">
                Cuatro áreas conectadas que acompañan un proyecto desde la primera consulta
                hasta el encendido final.
              </p>
            </div>
          </Reveal>
          <div className="emp-areas">
            {areas.map((area, i) => (
              <Reveal key={area.num} delay={i * 60}>
                <article className="emp-area">
                  <div className="emp-area-main">
                    <span className="emp-area-num">{area.num}</span>
                    <div className="emp-area-body">
                      <h3>{area.title}</h3>
                      <p>{area.text}</p>
                    </div>
                  </div>
                  <div className="emp-area-media" aria-hidden="true">
                    <img src={area.img} alt="" loading="lazy" width="1448" height="1086" />
                    <span>{area.cap}</span>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 5 · LO QUE NOS DEFINE ============ */}
      <section className="emp-virtues">
        <div className="emp-wrap">
          <Reveal>
            <p className="emp-eyebrow">Lo que nos define</p>
          </Reveal>
          <div className="emp-clauses">
            {virtues.map((v, i) => (
              <Reveal key={v.num} delay={i * 70}>
                <p className={`emp-clause emp-clause--${v.size} emp-clause--${v.align}`}>
                  <span className="emp-clause-num">{v.num}</span>
                  {v.text}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 6 · TECNOLOGÍA Y MARCA PROPIA ============ */}
      <section className="emp-tech">
        <div className="emp-wrap">
          <Reveal>
            <div className="emp-tech-head">
              <p className="emp-eyebrow">Tecnología y marca propia</p>
              <h2>Dos vías para cada proyecto</h2>
            </div>
          </Reveal>

          <Reveal>
            <article className="emp-partner emp-partner--tridonic">
              <figure className="emp-partner-media">
                <img
                  src="images/tridonic.png"
                  alt="Tecnología de control e iluminación TRIDONIC integrada por Boralba"
                  loading="lazy"
                  width="874"
                  height="594"
                />
                <figcaption><span>Fig. 03</span> Control e iluminación profesional</figcaption>
              </figure>
              <div className="emp-partner-copy">
                <p className="emp-kicker"><span>01</span> Partner tecnológico</p>
                <img
                  className="emp-partner-logo"
                  src="images/logo-tridonic.png"
                  alt="TRIDONIC"
                  loading="lazy"
                  width="627"
                  height="121"
                />
                <p className="emp-partner-text">
                  Integramos la tecnología de TRIDONIC para desarrollar instalaciones eficientes,
                  conectadas y adaptadas a cada proyecto. Un partner tecnológico que añade control,
                  regulación y gestión a la iluminación profesional.
                </p>
                <a
                  className="emp-arrowlink"
                  href="https://www.tridonic.com/en/int"
                  target="_blank"
                  rel="noreferrer"
                >
                  Visitar TRIDONIC <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          </Reveal>

          <Reveal delay={90}>
            <article className="emp-partner emp-partner--halopack">
              <figure className="emp-partner-media">
                <img
                  src="images/foto-halopack.png"
                  alt="Soluciones LED HALOPACK, la marca propia de Boralba"
                  loading="lazy"
                  width="1448"
                  height="1086"
                />
                <figcaption><span>Fig. 04</span> Soluciones LED propias</figcaption>
              </figure>
              <div className="emp-partner-copy">
                <p className="emp-kicker"><span>02</span> Marca propia</p>
                <img
                  className="emp-partner-logo"
                  src="images/logo-halopack.png"
                  alt="HALOPACK"
                  loading="lazy"
                  width="715"
                  height="116"
                />
                <p className="emp-partner-text">
                  HALOPACK es la marca propia de Boralba. Nos permite desarrollar y configurar
                  soluciones de iluminación a medida: una vía directa para que cada proyecto
                  tenga la luminaria que de verdad necesita.
                </p>
                <Link to="/disena-tu-luminaria" className="emp-arrowlink">
                  Diseña tu luminaria <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      {/* ============ 7 · CIERRE EDITORIAL ============ */}
      <section className="emp-outro">
        <div className="emp-wrap">
          <Reveal>
            <p className="emp-eyebrow">Hablemos</p>
            <h2>
              Cada proyecto comienza con una idea.
              <br />
              Nosotros ayudamos a convertirla en luz.
            </h2>
            <Link to="/contacto" className="emp-cta">
              Hablemos de tu proyecto
            </Link>
            <p className="emp-outro-note">
              Respuesta en menos de 24 horas · sin compromiso
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
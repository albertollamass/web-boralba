import { Link, useParams, Navigate } from 'react-router-dom'

const contents = {
  'aviso-legal': {
    title: 'Aviso Legal',
    body: [
      'En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa que este sitio web es titularidad de BORALBA LIGHTING, S.L., con domicilio en P.I. Los Olivos, C/ Destreza 3, Nave 10-D, 28906 Getafe (Madrid).',
      'El acceso y uso de este sitio web atribuye la condición de usuario e implica la aceptación de las condiciones recogidas en el presente Aviso Legal.',
      'BORALBA LIGHTING, S.L. no se hace responsable de la información y contenidos almacenados, a título enunciativo pero no limitativo, en foros, chats, generadores de blogs, comentarios, redes sociales o cualesquiera otros medios que permitan a terceros publicar contenidos.',
      'El usuario se obliga a hacer un uso adecuado de los contenidos que BORALBA LIGHTING, S.L. ofrece a través de su web y con carácter enunciativo pero no limitativo, a no emplearlos para incurrir en actividades ilícitas, ilícitas o contrarias a la buena fe y al orden público.',
      'Para cualquier duda o consulta puede contactar con nosotros a través del correo boralba@boralba.es o del teléfono (34) 91 870 71 13.',
    ],
  },
  'politica-privacidad': {
    title: 'Política de Privacidad',
    body: [
      'El RESPONSABLE del tratamiento es BORALBA LIGHTING, S.L., domicilio en P.I. Los Olivos, C/ Destreza 3, Nave 10-D, 28906 Getafe (Madrid).',
      'Fines: gestión de la petición, solicitud o consulta realizada a través de los formularios de contacto de la web.',
      'Legitimación: el consentimiento del interesado.',
      'Podrá ejercer los derechos de acceso, rectificación, supresión, oposición, portabilidad y limitación del tratamiento enviando un correo a boralba@boralba.es.',
      'Puede acceder a la información restante en la Política de privacidad de www.led-iluminacion.es.',
    ],
  },
  'politica-cookies': {
    title: 'Política de Cookies',
    body: [
      'Las cookies son pequeños archivos de texto que las páginas web pueden utilizar para hacer más eficiente la experiencia del usuario.',
      'La Ley afirma que podemos almacenar cookies en su dispositivo si son estrictamente necesarias para el funcionamiento de esta página. Para todos los demás tipos de cookies necesitamos su permiso.',
      'Las cookies estrictamente necesarias incluyen: cookies de sesión de usuario, cookies de comentario, cookies de seguridad y cookies de aceptación de cookies (moove_gdpr_popup).',
      'Como usuario, en todo momento tiene la posibilidad de ejercer su derecho a bloquear, eliminar y rechazar el uso de cookies, modificando las opciones de su navegador o en los ajustes de cookies de esta web.',
      'Esta web no utiliza Google Analytics.',
    ],
  },
}

export default function Legal() {
  const { slug } = useParams()
  const content = contents[slug]
  if (!content) return <Navigate to="/" replace />

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>{content.title}</span>
          </div>
          <h1>{content.title}</h1>
        </div>
      </div>
      <div className="container section" style={{ paddingTop: 0 }}>
        {content.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </>
  )
}

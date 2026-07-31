import { useEffect, useState } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('boralba_cookies_accepted')) {
      setVisible(true)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem('boralba_cookies_accepted', 'all')
    setVisible(false)
  }

  const rejectAll = () => {
    localStorage.setItem('boralba_cookies_accepted', 'rejected')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        boxShadow: '0 -8px 30px rgba(0,0,0,0.15)',
        zIndex: 100,
        padding: '16px 20px',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <p style={{ margin: 0, flex: 1, fontSize: '0.9rem', minWidth: 260 }}>
          Utilizamos cookies para mejorar nuestro servicio y su experiencia. Nos gustaría obtener
          su consentimiento para poder seguir haciéndolo. Para más información pulse en los
          Ajustes.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={acceptAll}>
            Aceptar todas
          </button>
          <button className="btn btn-outline btn-sm" onClick={rejectAll}>
            Rechazar todas
          </button>
        </div>
      </div>
    </div>
  )
}

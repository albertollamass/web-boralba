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
    window.dispatchEvent(new Event('boralba-consent-changed'))
    setVisible(false)
  }

  const rejectAll = () => {
    localStorage.setItem('boralba_cookies_accepted', 'rejected')
    window.dispatchEvent(new Event('boralba-consent-changed'))
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
        boxShadow: '0 -1px 0 0 rgba(24,24,27,0.08), 0 -8px 24px rgba(24,24,27,0.06)',
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
          Usamos medición analítica opcional para entender el uso del catálogo. No recogemos datos
          personales. Puedes aceptar o rechazar estas cookies.
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

import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState, useCallback } from 'react'
import Footer from './Footer'
import CookieBanner from './CookieBanner'
import HomeHeader from './HomeHeader'

export default function Layout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isHome = pathname === '/'
  const [menuOpen, setMenuOpen] = useState(false)

  const openSearch = useCallback(() => {
    setMenuOpen(false)
    navigate('/buscar')
  }, [navigate])

  const header = (
    <HomeHeader
      home={isHome}
      menuOpen={menuOpen}
      onMenuToggle={() => setMenuOpen((open) => !open)}
      onNavigate={() => setMenuOpen(false)}
      onSearchOpen={openSearch}
    />
  )

  return (
    <>
      {header}
      <div className={`site-frame${isHome ? ' home-frame' : ''}`}>
        <main className={`site-main${isHome ? ' home-main' : ' internal-page-container'}`}>
          <Outlet />
        </main>
        <Footer home={isHome} />
      </div>
      <CookieBanner />
    </>
  )
}
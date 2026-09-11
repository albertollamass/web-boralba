import { Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Footer from './Footer'
import CookieBanner from './CookieBanner'
import HomeHeader from './HomeHeader'

export default function Layout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <>
      {isHome ? <main className="site-main"><Outlet /></main> : (
        <div className="public-experience">
          <header className="public-experience-header">
            <HomeHeader menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} onNavigate={() => setMenuOpen(false)} />
          </header>
          <main className="site-main"><Outlet /></main>
        </div>
      )}
      <Footer home={isHome} />
      <CookieBanner />
    </>
  )
}

import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import CookieBanner from './CookieBanner'

export default function Layout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  return (
    <>
      {!isHome && <Header />}
      <main>
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
    </>
  )
}

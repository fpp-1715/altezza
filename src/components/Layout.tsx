import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { Toast } from './Toast'

export function Layout() {
  const location = useLocation()
  const { pathname } = location
  const isDetail = pathname.startsWith('/producto/')
  const isHome = pathname === '/'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="relative mx-auto w-full max-w-[480px] min-h-screen bg-surface shadow-[0_0_80px_rgba(0,0,0,0.6)]">
      {!isDetail && <Header />}
      <main
        className={`flex flex-col relative w-full bg-surface min-h-screen ${
          isDetail ? 'pt-16' : isHome ? 'pt-16' : 'pt-[84px]'
        } ${isDetail ? 'pb-0' : 'pb-24'}`}
      >
        <div key={`${location.pathname}${location.search}`} className="page-enter">
          <Outlet />
        </div>
      </main>
      {!isDetail && <BottomNav />}
      <Toast />
    </div>
  )
}

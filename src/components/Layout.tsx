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
    <div className="relative mx-auto min-h-screen w-full bg-surface md:shadow-none">
      {!isDetail && <Header />}
      <main
        className={`flex flex-col relative w-full bg-surface min-h-screen ${
          isDetail ? 'pt-16 md:pt-20' : isHome ? 'pt-16 md:pt-20' : 'pt-[84px] md:pt-20'
        } ${isDetail ? 'pb-0' : 'pb-24 md:pb-0'}`}
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

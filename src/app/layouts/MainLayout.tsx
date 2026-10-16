import { Outlet, ScrollRestoration } from 'react-router'
import { AgeGate } from '@/widgets/ageGate'
import { CartDrawer } from '@/widgets/cartDrawer'
import { Footer } from '@/widgets/footer'
import { Header } from '@/widgets/header'

/**
 * Каркас всех страниц. Лежит в app, потому что собирает несколько виджетов,
 * а виджеты по правилам FSD друг друга не импортируют.
 *
 * overflow-x-clip, а не hidden: hidden сделал бы обёртку
 * скролл-контейнером, и position: sticky у потомков перестал бы работать.
 */
const MainLayout = () => {
  return (
    <div className="relative min-h-svh overflow-x-clip">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <AgeGate />
      <ScrollRestoration />
    </div>
  )
}

export default MainLayout

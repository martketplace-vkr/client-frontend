import './App.css'
import {
  AuthDialog,
  AccountPage,
  CartPage,
  CatalogPage,
  FavoritesPage,
  HomePage,
  NotFoundPage,
  ProductPage,
  WalletPage,
} from './storefrontPages'
import { SiteHeader } from './components/layout/SiteHeader'
import { SiteNavigation } from './components/layout/SiteNavigation'
import { ToastHost } from './components/layout/ToastHost'
import { useStorefrontController } from './hooks/useStorefrontController'

function App() {
  const controller = useStorefrontController()

  return (
    <div className="app-shell">
      <div className="bg-orb bg-orb-one" />
      <div className="bg-orb bg-orb-two" />
      <div className="bg-grid" />

      <div className="app-frame">
        <SiteHeader {...controller.headerProps} />

        <SiteNavigation
          items={controller.navigationItems}
          activePage={controller.route.page}
          onSelectItem={controller.onSelectNavigationItem}
        />

        <main className="page-stage">
          {renderCurrentPage(controller)}
        </main>

        <SiteNavigation
          items={controller.navigationItems}
          activePage={controller.route.page}
          onSelectItem={controller.onSelectNavigationItem}
          mobile
        />

        <AuthDialog {...controller.authDialogProps} />
        <ToastHost toasts={controller.toasts} />
      </div>
    </div>
  )
}

function renderCurrentPage(controller) {
  if (controller.route.page === 'home') {
    return <HomePage {...controller.pageProps.home} />
  }

  if (controller.route.page === 'catalog') {
    return <CatalogPage {...controller.pageProps.catalog} />
  }

  if (controller.route.page === 'product') {
    return <ProductPage {...controller.pageProps.product} />
  }

  if (controller.route.page === 'favorites') {
    return <FavoritesPage {...controller.pageProps.favorites} />
  }

  if (controller.route.page === 'cart') {
    return <CartPage {...controller.pageProps.cart} />
  }

  if (controller.route.page === 'account' && controller.isAuthorized) {
    return <AccountPage {...controller.pageProps.account} />
  }

  if (controller.route.page === 'wallet' && controller.isAuthorized) {
    return <WalletPage {...controller.pageProps.wallet} />
  }

  if (controller.route.page === 'notFound') {
    return <NotFoundPage {...controller.pageProps.notFound} />
  }

  return null
}

export default App

import { startTransition, useDeferredValue, useEffect, useEffectEvent, useRef, useState } from 'react'
import './App.css'
import { ApiError, apiRequest, getStoredAccessToken, setStoredAccessToken } from './api'
import {
  emptyAddressForm,
  emptyProfile,
  flattenCategories,
  getProductId,
  getProductName,
  getProductPrice,
  normalizeAddress,
  normalizeProfile,
  productMatchesQuery,
  serializeProduct,
  toText,
} from './helpers'
import { navItems } from './marketplaceContent'
import {
  AuthDialog,
  AccountPage,
  CartPage,
  CatalogPage,
  FavoritesPage,
  HomePage,
  NotFoundPage,
  ProductPage,
} from './storefrontPages'

const CART_KEY = 'marketplace.store.cart'
const FAVORITES_KEY = 'marketplace.store.favorites'
const RECENT_KEY = 'marketplace.store.recent'

function App() {
  const [route, setRoute] = useState(() => readRoute())
  const [accessToken, setAccessToken] = useState(() => getStoredAccessToken())
  const [sessionStatus, setSessionStatus] = useState('checking')
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ email: '', password: '' })
  const [profileForm, setProfileForm] = useState(emptyProfile)
  const [addressForm, setAddressForm] = useState(emptyAddressForm)
  const [categories, setCategories] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [search, setSearch] = useState('')
  const [busyKeys, setBusyKeys] = useState({})
  const [toasts, setToasts] = useState([])
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [postAuthPath, setPostAuthPath] = useState('')
  const [cartItems, setCartItems] = useState(() => readStoredCollection(CART_KEY))
  const [favoriteItems, setFavoriteItems] = useState(() => readStoredCollection(FAVORITES_KEY))
  const [recentItems, setRecentItems] = useState(() => readStoredCollection(RECENT_KEY))
  const toastIdRef = useRef(0)
  const deferredSearch = useDeferredValue(search)

  const isAuthorized = Boolean(accessToken)
  const categoryOptions = flattenCategories(categories)
  const favoriteIds = favoriteItems.map((item) => getProductId(item)).filter(Boolean)
  const visibleProducts = products.filter((product) => productMatchesQuery(product, deferredSearch))
  const featuredProducts = visibleProducts.slice(0, 8)
  const latestProducts = visibleProducts.slice(0, 12)
  const popularCategories = categoryOptions.slice(0, 8)
  const spotlightProduct =
    route.page === 'product'
      ? getProductId(selectedProduct) === route.productId
        ? selectedProduct
        : null
      : selectedProduct || visibleProducts[0] || null
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + parsePriceValue(getProductPrice(item.snapshot || item)) * normalizeQuantity(item.quantity),
    0,
  )
  const cartCount = cartItems.reduce((sum, item) => sum + normalizeQuantity(item.quantity), 0)
  const cartLines = cartItems.map((item) => ({
    ...item,
    quantity: normalizeQuantity(item.quantity),
    lineTotal: parsePriceValue(getProductPrice(item.snapshot || item)) * normalizeQuantity(item.quantity),
  }))

  const handleBootstrapEffect = useEffectEvent(() => {
    void bootstrap()
  })
  const handleCatalogEffect = useEffectEvent((categoryId) => {
    void loadProducts(categoryId)
  })
  const handleRouteProductEffect = useEffectEvent((nextRoute) => {
    if (nextRoute.page !== 'product' || !nextRoute.productId) {
      return
    }

    const currentId = getProductId(selectedProduct)
    if (currentId === nextRoute.productId) {
      return
    }

    const fallbackProduct =
      products.find((product) => getProductId(product) === nextRoute.productId) ||
      favoriteItems.find((item) => getProductId(item) === nextRoute.productId) ||
      cartItems.find((item) => getProductId(item.snapshot) === nextRoute.productId)?.snapshot ||
      recentItems.find((item) => getProductId(item) === nextRoute.productId)

    if (fallbackProduct) {
      startTransition(() => {
        setSelectedProduct(fallbackProduct.snapshot || fallbackProduct)
      })
    }

    void openProduct(nextRoute.productId, { rememberView: true })
  })
  const handleTitleEffect = useEffectEvent((nextRoute) => {
    const titleMap = {
      home: 'Маркетплейс',
      catalog: 'Каталог',
      product: getProductName(selectedProduct) || 'Товар',
      favorites: 'Избранное',
      cart: 'Корзина',
      account: 'Профиль',
      notFound: 'Страница не найдена',
    }

    document.title = `${titleMap[nextRoute.page] || 'Маркетплейс'} | Маркетплейс`
  })
  const handleProtectedRouteEffect = useEffectEvent((nextRoute, authorized, currentSessionStatus) => {
    if (nextRoute.page !== 'account' || authorized || currentSessionStatus !== 'guest') {
      return
    }

    window.history.replaceState({}, '', '/')
    startTransition(() => {
      setRoute({ page: 'home' })
    })
    notify('Профиль доступен только после входа.', 'warning')
  })

  useEffect(() => {
    handleBootstrapEffect()
  }, [])

  useEffect(() => {
    handleCatalogEffect(selectedCategoryId)
  }, [selectedCategoryId])

  useEffect(() => {
    handleRouteProductEffect(route)
  }, [route])

  useEffect(() => {
    handleTitleEffect(route)
  }, [route, selectedProduct])

  useEffect(() => {
    handleProtectedRouteEffect(route, isAuthorized, sessionStatus)
  }, [route, isAuthorized, sessionStatus])

  useEffect(() => {
    const syncRoute = () => {
      startTransition(() => {
        setRoute(readRoute())
      })
    }

    window.addEventListener('popstate', syncRoute)
    return () => window.removeEventListener('popstate', syncRoute)
  }, [])

  useEffect(() => {
    writeStoredCollection(CART_KEY, cartItems)
  }, [cartItems])

  useEffect(() => {
    writeStoredCollection(FAVORITES_KEY, favoriteItems)
  }, [favoriteItems])

  useEffect(() => {
    writeStoredCollection(RECENT_KEY, recentItems)
  }, [recentItems])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow

    if (authDialogOpen) {
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [authDialogOpen])

  useEffect(() => {
    if (!authDialogOpen) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setAuthDialogOpen(false)
        setPostAuthPath('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [authDialogOpen])

  async function bootstrap() {
    await Promise.allSettled([loadCategories(), restoreSession()])
  }

  async function restoreSession() {
    const stored = getStoredAccessToken()

    if (!stored) {
      await refreshSession(true)
      return
    }

    try {
      setAccessToken(stored)
      setSessionStatus('active')
      await hydratePrivate(stored)
    } catch (error) {
      clearAuth()

      if (!(error instanceof ApiError && error.status === 401)) {
        handleError(error)
      }

      await refreshSession(true)
    }
  }

  async function loadCategories() {
    try {
      const response = await apiRequest('/api/v1/catalog/categories?include_children=true')
      startTransition(() => {
        setCategories(response.categories || [])
      })
    } catch (error) {
      handleError(error)
    }
  }

  async function loadProducts(categoryId = '') {
    setBusy('products', true)

    try {
      const params = new URLSearchParams({ page_size: '48' })
      if (toText(categoryId)) {
        params.set('category_id', toText(categoryId))
      }

      const response = await apiRequest(`/api/v1/catalog/products?${params.toString()}`)
      const nextProducts = response.products || []

      startTransition(() => {
        setProducts(nextProducts)
        setSelectedProduct((current) => {
          const currentId = getProductId(current)
          return nextProducts.find((product) => getProductId(product) === currentId) || current || nextProducts[0] || null
        })
      })
    } catch (error) {
      handleError(error)
    } finally {
      setBusy('products', false)
    }
  }

  async function openProduct(productId, { rememberView = false } = {}) {
    setBusy('product', true)

    try {
      const response = await apiRequest(`/api/v1/catalog/products/${productId}`)
      const nextProduct = response.product || null

      startTransition(() => {
        setSelectedProduct(nextProduct)
      })

      if (rememberView && nextProduct) {
        rememberProduct(nextProduct)
      }
    } catch (error) {
      handleError(error)
    } finally {
      setBusy('product', false)
    }
  }

  async function hydratePrivate(token) {
    const [profile, addressResponse] = await Promise.all([
      fetchProfile(token),
      apiRequest('/api/v1/users/me/addresses', { token }),
    ])

    startTransition(() => {
      setProfileForm(profile)
      setAddresses((addressResponse.addresses || []).map(normalizeAddress).filter(Boolean))
      setSessionStatus('active')
    })
  }

  async function fetchProfile(token) {
    try {
      const response = await apiRequest('/api/v1/users/me', { token })
      return normalizeProfile(response)
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return { ...emptyProfile }
      }

      throw error
    }
  }

  async function ensureAuthorized() {
    if (accessToken) {
      return accessToken
    }

    const refreshedToken = await refreshSession(true)
    if (refreshedToken) {
      return refreshedToken
    }

    throw new ApiError('Нужна авторизация.', 401)
  }

  async function authedRequest(path, options = {}) {
    const token = options.token || (await ensureAuthorized())
    return apiRequest(path, { ...options, token })
  }

  function storeAccessToken(token) {
    setStoredAccessToken(token)
    setAccessToken(token)
  }

  function clearAuth() {
    storeAccessToken('')
    setSessionStatus('guest')
    setProfileForm({ ...emptyProfile, email: authForm.email.trim() })
    setAddresses([])
  }

  function setBusy(key, value) {
    setBusyKeys((current) => {
      const next = { ...current }

      if (value) {
        next[key] = true
      } else {
        delete next[key]
      }

      return next
    })
  }

  function notify(message, type = 'info') {
    const id = toastIdRef.current + 1
    toastIdRef.current = id
    setToasts((current) => [...current, { id, message, type }])

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 3200)
  }

  function handleError(error) {
    if (error instanceof ApiError) {
      notify(error.message, error.status >= 500 ? 'error' : 'warning')
      return
    }

    if (error instanceof Error) {
      notify(error.message, 'warning')
      return
    }

    notify('Произошла непредвиденная ошибка.', 'error')
  }

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setBusy('auth', true)

    try {
      const email = authForm.email.trim()
      const password = authForm.password

      if (!email || !password) {
        throw new Error('Введите email и пароль.')
      }

      if (authMode === 'register') {
        await apiRequest('/api/v1/auth/register', {
          method: 'POST',
          body: { email, password },
        })
      }

      const response = await apiRequest('/api/v1/auth/login', {
        method: 'POST',
        body: { email, password },
      })

      const nextToken = toText(response.accessToken)
      if (!nextToken) {
        throw new Error('Сервер не вернул access token.')
      }

      storeAccessToken(nextToken)
      setAuthForm((current) => ({ ...current, password: '' }))
      await hydratePrivate(nextToken)

      setAuthDialogOpen(false)

      if (postAuthPath) {
        const nextPath = postAuthPath
        setPostAuthPath('')
        navigate(nextPath)
      }

      notify(authMode === 'register' ? 'Аккаунт создан, вход выполнен.' : 'Вы вошли в аккаунт.', 'success')
    } catch (error) {
      handleError(error)
    } finally {
      setBusy('auth', false)
    }
  }

  async function refreshSession(silent = false) {
    setBusy('refresh', true)

    try {
      const response = await apiRequest('/api/v1/auth/refresh', {
        method: 'POST',
      })

      const nextToken = toText(response.accessToken)
      if (!nextToken) {
        throw new Error('Сервер не вернул новый access token.')
      }

      storeAccessToken(nextToken)
      await hydratePrivate(nextToken)

      if (!silent) {
        notify('Сессия обновлена.', 'success')
      }

      return nextToken
    } catch (error) {
      clearAuth()

      if (!silent && !(error instanceof ApiError && error.status === 401)) {
        handleError(error)
      }

      if (!silent && error instanceof ApiError && error.status === 401) {
        notify('Сессия истекла. Войдите снова.', 'warning')
      }

      return ''
    } finally {
      setBusy('refresh', false)
    }
  }

  async function handleLogout() {
    setBusy('logout', true)

    try {
      await apiRequest('/api/v1/auth/logout', { method: 'POST' })
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) {
        handleError(error)
      }
    } finally {
      clearAuth()
      setBusy('logout', false)
    }

    setAuthDialogOpen(false)
    setPostAuthPath('')

    if (route.page === 'account') {
      window.history.replaceState({}, '', '/')
      startTransition(() => {
        setRoute({ page: 'home' })
      })
    }

    notify('Вы вышли из аккаунта.', 'success')
  }

  async function handleProfileSubmit(event) {
    event.preventDefault()
    setBusy('profile', true)

    try {
      const response = await authedRequest('/api/v1/users/me', {
        method: 'PATCH',
        body: {
          email: profileForm.email.trim(),
          first_name: profileForm.firstName.trim(),
          last_name: profileForm.lastName.trim(),
          avatar_url: profileForm.avatarUrl.trim(),
        },
      })

      startTransition(() => {
        setProfileForm(normalizeProfile(response))
      })
      notify('Профиль сохранен.', 'success')
    } catch (error) {
      handleError(error)
    } finally {
      setBusy('profile', false)
    }
  }

  async function handleAddressSubmit(event) {
    event.preventDefault()
    setBusy('address', true)

    try {
      const response = await authedRequest('/api/v1/users/me/addresses', {
        method: 'POST',
        body: {
          country: addressForm.country.trim(),
          city: addressForm.city.trim(),
          street: addressForm.street.trim(),
          postal_code: addressForm.postalCode.trim(),
        },
      })

      startTransition(() => {
        setAddresses((current) => [normalizeAddress(response.address), ...current].filter(Boolean))
        setAddressForm(emptyAddressForm)
      })
      notify('Адрес добавлен.', 'success')
    } catch (error) {
      handleError(error)
    } finally {
      setBusy('address', false)
    }
  }

  async function handleReloadAddresses() {
    setBusy('addresses', true)

    try {
      const token = await ensureAuthorized()
      const response = await apiRequest('/api/v1/users/me/addresses', { token })
      startTransition(() => {
        setAddresses((response.addresses || []).map(normalizeAddress).filter(Boolean))
      })
      notify('Адреса обновлены.', 'info')
    } catch (error) {
      handleError(error)
    } finally {
      setBusy('addresses', false)
    }
  }

  function navigate(path) {
    if (`${window.location.pathname}${window.location.search}` === path) {
      return
    }

    window.history.pushState({}, '', path)
    startTransition(() => {
      setRoute(readRoute())
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openAuthDialog(mode = 'login') {
    setAuthMode(mode)
    setAuthDialogOpen(true)
  }

  function closeAuthDialog() {
    setAuthDialogOpen(false)
    setPostAuthPath('')
  }

  function requestProtectedNavigation(path, message) {
    setPostAuthPath(path)
    openAuthDialog('login')
    notify(message, 'info')
  }

  function handleSearchSubmit(event) {
    event.preventDefault()
    navigate('/catalog')
  }

  function handleCategorySelect(categoryId) {
    startTransition(() => {
      setSelectedCategoryId(categoryId)
    })

    if (route.page !== 'catalog') {
      navigate('/catalog')
    }
  }

  function rememberProduct(product) {
    const snapshot = serializeProduct(product)
    const productId = getProductId(snapshot)

    if (!productId) {
      return
    }

    setRecentItems((current) => [snapshot, ...current.filter((item) => getProductId(item) !== productId)].slice(0, 6))
  }

  function goToProduct(product) {
    const productId = getProductId(product)
    if (!productId) {
      return
    }

    startTransition(() => {
      setSelectedProduct(product)
    })
    rememberProduct(product)
    navigate(`/product/${productId}`)
    void openProduct(productId, { rememberView: false })
  }

  function toggleFavorite(product) {
    const snapshot = serializeProduct(product)
    const productId = getProductId(snapshot)

    if (!productId) {
      return
    }

    setFavoriteItems((current) => {
      if (current.some((item) => getProductId(item) === productId)) {
        notify('Товар удален из избранного.', 'info')
        return current.filter((item) => getProductId(item) !== productId)
      }

      notify('Товар добавлен в избранное.', 'success')
      return [snapshot, ...current]
    })
  }

  function addToCart(product, quantity = 1) {
    const snapshot = serializeProduct(product)
    const productId = getProductId(snapshot)

    if (!productId) {
      return
    }

    setCartItems((current) => {
      const existing = current.find((item) => getProductId(item.snapshot) === productId)
      if (existing) {
        return current.map((item) =>
          getProductId(item.snapshot) === productId
            ? { ...item, quantity: normalizeQuantity(item.quantity) + normalizeQuantity(quantity), snapshot }
            : item,
        )
      }

      return [...current, { id: productId, quantity: normalizeQuantity(quantity), snapshot }]
    })
    notify('Товар добавлен в корзину.', 'success')
  }

  function updateCartQuantity(productId, quantity) {
    const nextQuantity = normalizeQuantity(quantity)

    if (nextQuantity <= 0) {
      setCartItems((current) => current.filter((item) => getProductId(item.snapshot) !== productId))
      notify('Товар удален из корзины.', 'info')
      return
    }

    setCartItems((current) =>
      current.map((item) =>
        getProductId(item.snapshot) === productId ? { ...item, quantity: nextQuantity } : item,
      ),
    )
  }

  function removeFromCart(productId) {
    setCartItems((current) => current.filter((item) => getProductId(item.snapshot) !== productId))
    notify('Товар удален из корзины.', 'info')
  }

  function clearCart() {
    setCartItems([])
    notify('Корзина очищена.', 'info')
  }

  function handleCheckout() {
    if (cartItems.length === 0) {
      notify('Корзина пока пустая.', 'warning')
      return
    }

    if (!isAuthorized) {
      requestProtectedNavigation('/account', 'Войдите в аккаунт, чтобы продолжить оформление.')
      return
    }

    notify('UI для checkout готов. Для финального оформления нужен orders API.', 'info')
  }

  function isCurrentPage(page) {
    return route.page === page
  }

  return (
    <div className="app-shell">
      <div className="bg-orb bg-orb-one" />
      <div className="bg-orb bg-orb-two" />
      <div className="bg-grid" />

      <div className="app-frame">
        <header className="site-header">
          <button className="brand-mark" type="button" onClick={() => navigate('/')}>
            <span className="brand-mark__badge">M</span>
            <span className="brand-mark__copy">
              <strong>Маркетплейс</strong>
              <span>быстрые покупки каждый день</span>
            </span>
          </button>

          <form className="header-search" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Искать товары, бренды и категории"
              aria-label="Поиск"
            />
            <button className="button button-primary" type="submit">
              Найти
            </button>
          </form>

          <div className="header-actions">
            <button className="icon-chip" type="button" onClick={() => navigate('/favorites')}>
              <span>Избранное</span>
              <strong>{favoriteItems.length}</strong>
            </button>
            <button className="icon-chip" type="button" onClick={() => navigate('/cart')}>
              <span>Корзина</span>
              <strong>{cartCount}</strong>
            </button>
            <button
              className={`profile-chip session-${sessionStatus}`}
              type="button"
              onClick={() =>
                isAuthorized
                  ? navigate('/account')
                  : requestProtectedNavigation('/account', 'Профиль доступен только после входа.')
              }
            >
              <span>{isAuthorized ? 'Профиль' : 'Войти'}</span>
              <strong>{isAuthorized ? profileForm.firstName || 'Аккаунт' : 'Гость'}</strong>
            </button>
          </div>
        </header>

        <nav className="main-nav" aria-label="Основная навигация">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`nav-link ${isCurrentPage(item.page) ? 'active' : ''}`}
              type="button"
              onClick={() =>
                item.page === 'account' && !isAuthorized
                  ? requestProtectedNavigation('/account', 'Профиль доступен только после входа.')
                  : navigate(item.path)
              }
            >
              {item.label}
            </button>
          ))}
        </nav>

        <main className="page-stage">
          {route.page === 'home' ? (
            <HomePage
              featuredProducts={featuredProducts}
              latestProducts={latestProducts}
              popularCategories={popularCategories}
              favoriteIds={favoriteIds}
              busyProducts={busyKeys.products}
              onCategorySelect={handleCategorySelect}
              onOpenProduct={goToProduct}
              onToggleFavorite={toggleFavorite}
              onAddToCart={addToCart}
              onGoCatalog={() => navigate('/catalog')}
            />
          ) : null}

          {route.page === 'catalog' ? (
            <CatalogPage
              categories={categoryOptions}
              selectedCategoryId={selectedCategoryId}
              onCategoryChange={handleCategorySelect}
              search={search}
              onSearchChange={setSearch}
              visibleProducts={visibleProducts}
              favoriteIds={favoriteIds}
              busyProducts={busyKeys.products}
              onReload={() => loadProducts(selectedCategoryId)}
              onOpenProduct={goToProduct}
              onToggleFavorite={toggleFavorite}
              onAddToCart={addToCart}
              onResetFilters={() => {
                startTransition(() => {
                  setSelectedCategoryId('')
                  setSearch('')
                })
              }}
            />
          ) : null}

          {route.page === 'product' ? (
            <ProductPage
              product={spotlightProduct}
              busy={busyKeys.product}
              isFavorite={favoriteIds.includes(getProductId(spotlightProduct))}
              onBack={() => navigate('/catalog')}
              onToggleFavorite={toggleFavorite}
              onAddToCart={addToCart}
              relatedProducts={featuredProducts.filter((product) => getProductId(product) !== getProductId(spotlightProduct)).slice(0, 4)}
              onOpenProduct={goToProduct}
            />
          ) : null}

          {route.page === 'favorites' ? (
            <FavoritesPage
              items={favoriteItems}
              recentItems={recentItems}
              onOpenProduct={goToProduct}
              onToggleFavorite={toggleFavorite}
              onAddToCart={addToCart}
            />
          ) : null}

          {route.page === 'cart' ? (
            <CartPage
              items={cartLines}
              total={cartTotal}
              totalCount={cartCount}
              isAuthorized={isAuthorized}
              addressCount={isAuthorized ? addresses.length : 0}
              onOpenProduct={goToProduct}
              onQuantityChange={updateCartQuantity}
              onRemove={removeFromCart}
              onClearCart={clearCart}
              onCheckout={handleCheckout}
            />
          ) : null}

          {route.page === 'account' && isAuthorized ? (
            <AccountPage
              isAuthorized={isAuthorized}
              sessionStatus={sessionStatus}
              authMode={authMode}
              authForm={authForm}
              profileForm={profileForm}
              addressForm={addressForm}
              addresses={addresses}
              busyKeys={busyKeys}
              cartCount={cartCount}
              favoriteCount={favoriteItems.length}
              onAuthModeChange={setAuthMode}
              onAuthFormChange={setAuthForm}
              onProfileChange={setProfileForm}
              onAddressChange={setAddressForm}
              onAuthSubmit={handleAuthSubmit}
              onProfileSubmit={handleProfileSubmit}
              onAddressSubmit={handleAddressSubmit}
              onRefreshSession={() => refreshSession(false)}
              onLogout={handleLogout}
              onReloadAddresses={handleReloadAddresses}
            />
          ) : null}

          {route.page === 'notFound' ? <NotFoundPage onGoHome={() => navigate('/')} /> : null}
        </main>

        <nav className="mobile-nav" aria-label="Мобильная навигация">
          {navItems.map((item) => (
            <button
              key={`mobile-${item.path}`}
              className={`mobile-nav__link ${isCurrentPage(item.page) ? 'active' : ''}`}
              type="button"
              onClick={() =>
                item.page === 'account' && !isAuthorized
                  ? requestProtectedNavigation('/account', 'Профиль доступен только после входа.')
                  : navigate(item.path)
              }
            >
              {item.label}
            </button>
          ))}
        </nav>

        <AuthDialog
          open={authDialogOpen}
          authMode={authMode}
          authForm={authForm}
          busyKeys={busyKeys}
          onClose={closeAuthDialog}
          onAuthModeChange={setAuthMode}
          onAuthFormChange={setAuthForm}
          onAuthSubmit={handleAuthSubmit}
        />

        <div className="toast-host" aria-live="polite">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              {toast.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function readRoute() {
  const pathname = window.location.pathname || '/'
  const cleanPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname

  if (cleanPath === '/') {
    return { page: 'home' }
  }

  if (cleanPath === '/catalog') {
    return { page: 'catalog' }
  }

  if (cleanPath === '/favorites') {
    return { page: 'favorites' }
  }

  if (cleanPath === '/cart') {
    return { page: 'cart' }
  }

  if (cleanPath === '/account') {
    return { page: 'account' }
  }

  if (cleanPath.startsWith('/product/')) {
    const productId = decodeURIComponent(cleanPath.slice('/product/'.length))
    return productId ? { page: 'product', productId } : { page: 'notFound' }
  }

  return { page: 'notFound' }
}

function readStoredCollection(key) {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStoredCollection(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function normalizeQuantity(value) {
  const parsed = Number.parseInt(toText(value), 10)
  if (!Number.isInteger(parsed) || parsed < 0) {
    return 0
  }

  return parsed
}

function parsePriceValue(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  const normalized = toText(value).replace(/\s+/g, '').replace(',', '.')
  const match = normalized.match(/-?\d+(?:\.\d+)?/)

  if (!match) {
    return 0
  }

  const parsed = Number.parseFloat(match[0])
  return Number.isFinite(parsed) ? parsed : 0
}

export default App

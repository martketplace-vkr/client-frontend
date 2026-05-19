import { startTransition, useDeferredValue, useEffect, useEffectEvent, useRef, useState } from 'react'
import {
  ApiError,
  apiRequest,
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredAccessToken,
  setStoredRefreshToken,
  uploadMediaFile,
} from '../api'
import {
  emptyAddressForm,
  emptyProfile,
  flattenCategories,
  getProductId,
  getProductName,
  normalizeAddress,
  normalizeProfile,
  productMatchesQuery,
  serializeProduct,
  toText,
} from '../helpers'
import { navItems } from '../marketplaceContent'
import { buildCartLines, getCartCount, getCartTotal, normalizeQuantity } from '../app/commerce'
import { readRoute } from '../app/router'
import { CART_KEY, FAVORITES_KEY, RECENT_KEY, readStoredCollection, writeStoredCollection } from '../app/storage'

const ACCOUNT_ACCESS_MESSAGE = 'Профиль доступен только после входа.'
const TITLE_MAP = {
  home: 'Маркетплейс',
  catalog: 'Каталог',
  favorites: 'Избранное',
  cart: 'Корзина',
  wallet: 'Кошелек',
  account: 'Профиль',
  notFound: 'Страница не найдена',
}

export function useStorefrontController() {
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
  const [orders, setOrders] = useState([])
  const [wallet, setWallet] = useState(null)
  const [depositAddresses, setDepositAddresses] = useState([])
  const [transactions, setTransactions] = useState([])
  const [topUps, setTopUps] = useState([])
  const [topUpForm, setTopUpForm] = useState({ amount: '10.000000' })
  const [withdrawalForm, setWithdrawalForm] = useState({ amount: '', destination: '' })
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
  const cartTotal = getCartTotal(cartItems)
  const cartCount = getCartCount(cartItems)
  const cartLines = buildCartLines(cartItems)
  const hasPrivateData = isAuthorized && sessionStatus === 'active'

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
    const pageTitle =
      nextRoute.page === 'product' ? getProductName(selectedProduct) || 'Товар' : TITLE_MAP[nextRoute.page] || 'Маркетплейс'

    document.title = `${pageTitle} | Маркетплейс`
  })
  const handleProtectedRouteEffect = useEffectEvent((nextRoute, authorized, currentSessionStatus) => {
    if (!['account', 'wallet'].includes(nextRoute.page) || authorized || currentSessionStatus !== 'guest') {
      return
    }

    window.history.replaceState({}, '', '/')
    startTransition(() => {
      setRoute({ page: 'home' })
    })
    notify(ACCOUNT_ACCESS_MESSAGE, 'warning')
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
      if (error instanceof ApiError && error.status === 401) {
        clearAuth()
        await refreshSession(true)
        return
      }

      setSessionStatus('active')
      handleError(error)
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
    const [profileResult, addressResult] = await Promise.allSettled([
      fetchProfile(token),
      apiRequest('/api/v1/users/me/addresses', { token }),
    ])

    if (profileResult.status === 'rejected' && profileResult.reason instanceof ApiError && profileResult.reason.status === 401) {
      throw profileResult.reason
    }
    if (addressResult.status === 'rejected' && addressResult.reason instanceof ApiError && addressResult.reason.status === 401) {
      throw addressResult.reason
    }

    startTransition(() => {
      if (profileResult.status === 'fulfilled') {
        setProfileForm(profileResult.value)
      }
      if (addressResult.status === 'fulfilled') {
        setAddresses((addressResult.value.addresses || []).map(normalizeAddress).filter(Boolean))
      }
      setSessionStatus('active')
    })

    void loadPrivateDashboard(token, true)
  }

  async function loadPrivateDashboard(token = accessToken, silent = false) {
    if (!token) {
      return
    }

    setBusy('dashboard', true)

    const [ordersResult, walletResult, transactionsResult, topUpsResult, depositAddressesResult] = await Promise.allSettled([
      apiRequest('/api/v1/orders', { token }),
      apiRequest('/api/v1/balance/wallet', { token }),
      apiRequest('/api/v1/balance/transactions?currency_code=2001&limit=20&offset=0', { token }),
      apiRequest('/api/v1/balance/top-ups?limit=20&offset=0', { token }),
      apiRequest('/api/v1/balance/deposit-addresses', { token }),
    ])

    startTransition(() => {
      if (ordersResult.status === 'fulfilled') {
        setOrders(ordersResult.value.orders || [])
      }
      if (walletResult.status === 'fulfilled') {
        setWallet(walletResult.value.wallet || null)
      }
      if (transactionsResult.status === 'fulfilled') {
        setTransactions(transactionsResult.value.transactions || [])
      }
      if (topUpsResult.status === 'fulfilled') {
        setTopUps(topUpsResult.value.topUps || topUpsResult.value.top_ups || [])
      }
      if (depositAddressesResult.status === 'fulfilled') {
        setDepositAddresses(depositAddressesResult.value.depositAddresses || depositAddressesResult.value.deposit_addresses || [])
      }
    })

    const rejected = [ordersResult, walletResult, transactionsResult, topUpsResult, depositAddressesResult].find((result) => result.status === 'rejected')
    if (rejected && !silent) {
      handleError(rejected.reason)
    }

    setBusy('dashboard', false)
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

  function storeAuthTokens(response, failureMessage, operation) {
    const accessToken = getAccessTokenFromResponse(response, failureMessage, operation)
    const refreshToken = toText(response?.refreshToken ?? response?.refresh_token).trim()

    storeAccessToken(accessToken)
    if (refreshToken) {
      setStoredRefreshToken(refreshToken)
    }

    return accessToken
  }

  function clearAuth() {
    storeAccessToken('')
    setStoredRefreshToken('')
    setSessionStatus('guest')
    setProfileForm({ ...emptyProfile, email: authForm.email.trim() })
    setAddresses([])
    setOrders([])
    setWallet(null)
    setDepositAddresses([])
    setTransactions([])
    setTopUps([])
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

      const nextToken = storeAuthTokens(
        response,
        'Не удалось выполнить вход. Попробуйте еще раз.',
        'login',
      )

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
      const refreshToken = getStoredRefreshToken()
      const response = await apiRequest('/api/v1/auth/refresh', {
        method: 'POST',
        body: refreshToken ? { refresh_token: refreshToken } : undefined,
      })

      const nextToken = storeAuthTokens(
        response,
        'Не удалось обновить сессию. Войдите снова.',
        'refresh',
      )

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
      const refreshToken = getStoredRefreshToken()
      await apiRequest('/api/v1/auth/logout', {
        method: 'POST',
        body: refreshToken ? { refresh_token: refreshToken } : undefined,
      })
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

    if (['account', 'wallet'].includes(route.page)) {
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

  async function handleProfileAvatarUpload(event) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    setBusy('mediaAvatar', true)

    try {
      const token = await ensureAuthorized()
      const response = await uploadMediaFile(file, { token, directory: 'avatars/clients' })
      const fileUrl = toText(response?.fileUrl ?? response?.file_url).trim()

      if (!fileUrl) {
        throw new Error('Media service не вернул file_url.')
      }

      startTransition(() => {
        setProfileForm((current) => ({ ...current, avatarUrl: fileUrl }))
      })
      notify('Аватар загружен. Сохраните профиль, чтобы применить ссылку.', 'success')
    } catch (error) {
      handleError(error)
    } finally {
      setBusy('mediaAvatar', false)
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

  async function handleReloadDashboard() {
    try {
      const token = await ensureAuthorized()
      await loadPrivateDashboard(token, false)
      notify('Данные аккаунта обновлены.', 'info')
    } catch (error) {
      handleError(error)
    }
  }

  async function handleCreateCryptoTopUp(event) {
    event.preventDefault()
    setBusy('topUp', true)

    try {
      const amount = topUpForm.amount.trim()
      if (!amount) {
        throw new Error('Введите сумму пополнения.')
      }

      const response = await authedRequest('/api/v1/balance/top-ups/crypto', {
        method: 'POST',
        body: {
          amount,
          currency_code: 2001,
          provider_name: 'USDT-TRC20',
          network: 'TRON',
        },
      })

      startTransition(() => {
        setTopUps((current) => [response.topUp || response.top_up, ...current].filter(Boolean))
      })
      notify('Адрес для USDT-TRC20 пополнения создан.', 'success')
      await loadPrivateDashboard(accessToken, true)
    } catch (error) {
      handleError(error)
    } finally {
      setBusy('topUp', false)
    }
  }

  async function handleCreateWithdrawal(event) {
    event.preventDefault()
    setBusy('withdrawal', true)

    try {
      const amount = withdrawalForm.amount.trim()
      const destination = withdrawalForm.destination.trim()
      if (!amount || !destination) {
        throw new Error('Введите сумму и TRON адрес для вывода.')
      }

      await authedRequest('/api/v1/balance/withdrawals', {
        method: 'POST',
        body: {
          amount,
          currency_code: 2001,
          destination_type: 2,
          destination,
        },
      })

      startTransition(() => {
        setWithdrawalForm({ amount: '', destination: '' })
      })
      notify('Заявка на вывод создана.', 'success')
      await loadPrivateDashboard(accessToken, true)
    } catch (error) {
      handleError(error)
    } finally {
      setBusy('withdrawal', false)
    }
  }

  async function handleCancelOrder(orderId) {
    setBusy(`order-${orderId}`, true)

    try {
      const response = await authedRequest(`/api/v1/orders/${orderId}/cancel`, {
        method: 'POST',
      })

      startTransition(() => {
        setOrders((current) =>
          current.map((order) => (toText(order.id) === toText(orderId) ? response.order || order : order)),
        )
      })
      notify('Заказ отменен.', 'success')
    } catch (error) {
      handleError(error)
    } finally {
      setBusy(`order-${orderId}`, false)
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

  async function handleCheckout() {
    if (cartItems.length === 0) {
      notify('Корзина пока пустая.', 'warning')
      return
    }

    if (!isAuthorized) {
      requestProtectedNavigation('/account', 'Войдите в аккаунт, чтобы продолжить оформление.')
      return
    }

    setBusy('checkout', true)

    try {
      const productIds = cartItems.flatMap((item) => {
        const productId = Number.parseInt(getProductId(item.snapshot), 10)
        if (!Number.isInteger(productId) || productId <= 0) {
          return []
        }

        return Array.from({ length: normalizeQuantity(item.quantity) }, () => productId)
      })

      if (productIds.length === 0) {
        throw new Error('В корзине нет товаров, которые можно оформить.')
      }

      const response = await authedRequest('/api/v1/orders/checkout', {
        method: 'POST',
        body: {
          checkout_id: `web-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          product_ids: productIds,
          expected_cart_version: 0,
        },
      })

      startTransition(() => {
        setOrders((current) => [...(response.orders || []), ...current])
        setCartItems([])
      })
      notify('Заказ создан. Оплату можно проверить в кошельке.', 'success')
      navigate('/wallet')
      await loadPrivateDashboard(accessToken, true)
    } catch (error) {
      handleError(error)
    } finally {
      setBusy('checkout', false)
    }
  }

  function openAccount() {
    if (isAuthorized) {
      navigate('/account')
      return
    }

    requestProtectedNavigation('/account', ACCOUNT_ACCESS_MESSAGE)
  }

  function handleNavigationItem(item) {
    if (['account', 'wallet'].includes(item.page) && !isAuthorized) {
      requestProtectedNavigation(item.path, ACCOUNT_ACCESS_MESSAGE)
      return
    }

    navigate(item.path)
  }

  const pageProps = {
    home: {
      featuredProducts,
      latestProducts,
      popularCategories,
      favoriteIds,
      busyProducts: busyKeys.products,
      onCategorySelect: handleCategorySelect,
      onOpenProduct: goToProduct,
      onToggleFavorite: toggleFavorite,
      onAddToCart: addToCart,
      onGoCatalog: () => navigate('/catalog'),
    },
    catalog: {
      categories: categoryOptions,
      selectedCategoryId,
      onCategoryChange: handleCategorySelect,
      search,
      onSearchChange: setSearch,
      visibleProducts,
      favoriteIds,
      busyProducts: busyKeys.products,
      onReload: () => loadProducts(selectedCategoryId),
      onOpenProduct: goToProduct,
      onToggleFavorite: toggleFavorite,
      onAddToCart: addToCart,
      onResetFilters: () => {
        startTransition(() => {
          setSelectedCategoryId('')
          setSearch('')
        })
      },
    },
    product: {
      product: spotlightProduct,
      busy: busyKeys.product,
      isFavorite: favoriteIds.includes(getProductId(spotlightProduct)),
      onBack: () => navigate('/catalog'),
      onToggleFavorite: toggleFavorite,
      onAddToCart: addToCart,
      relatedProducts: featuredProducts
        .filter((product) => getProductId(product) !== getProductId(spotlightProduct))
        .slice(0, 4),
      onOpenProduct: goToProduct,
    },
    favorites: {
      items: favoriteItems,
      recentItems,
      onOpenProduct: goToProduct,
      onToggleFavorite: toggleFavorite,
      onAddToCart: addToCart,
    },
    cart: {
      items: cartLines,
      total: cartTotal,
      totalCount: cartCount,
      isAuthorized,
      addressCount: isAuthorized ? addresses.length : 0,
      checkoutBusy: busyKeys.checkout,
      onOpenProduct: goToProduct,
      onQuantityChange: updateCartQuantity,
      onRemove: removeFromCart,
      onClearCart: clearCart,
      onCheckout: handleCheckout,
    },
    account: {
      isAuthorized,
      sessionStatus,
      profileForm,
      addressForm,
      addresses,
      orders,
      wallet,
      depositAddresses,
      transactions,
      topUps,
      favoriteItems,
      busyKeys,
      cartCount,
      favoriteCount: favoriteItems.length,
      onProfileChange: setProfileForm,
      onAddressChange: setAddressForm,
      onProfileSubmit: handleProfileSubmit,
      onAvatarUpload: handleProfileAvatarUpload,
      onAddressSubmit: handleAddressSubmit,
      onCancelOrder: handleCancelOrder,
      onReloadDashboard: handleReloadDashboard,
      onLogout: handleLogout,
      onReloadAddresses: handleReloadAddresses,
      onOpenProduct: goToProduct,
      onToggleFavorite: toggleFavorite,
      onAddToCart: addToCart,
      hasPrivateData,
    },
    wallet: {
      isAuthorized,
      selectedCurrency: route.walletCurrency || '',
      wallet,
      depositAddresses,
      transactions,
      topUps,
      topUpForm,
      withdrawalForm,
      busyKeys,
      onTopUpChange: setTopUpForm,
      onWithdrawalChange: setWithdrawalForm,
      onCreateCryptoTopUp: handleCreateCryptoTopUp,
      onCreateWithdrawal: handleCreateWithdrawal,
      onReloadDashboard: handleReloadDashboard,
      onOpenWallet: (currency) => navigate(`/wallet/${currency}`),
      onBackToWallets: () => navigate('/wallet'),
      hasPrivateData,
    },
    notFound: {
      onGoHome: () => navigate('/'),
    },
  }

  return {
    route,
    isAuthorized,
    navigationItems: navItems,
    onSelectNavigationItem: handleNavigationItem,
    headerProps: {
      search,
      onSearchChange: setSearch,
      onSearchSubmit: handleSearchSubmit,
      onOpenHome: () => navigate('/'),
      onOpenFavorites: () => navigate('/favorites'),
      onOpenCart: () => navigate('/cart'),
      onOpenAccount: openAccount,
      favoriteCount: favoriteItems.length,
      cartCount,
      sessionStatus,
      isAuthorized,
      profileName: isAuthorized ? profileForm.firstName || 'Аккаунт' : 'Гость',
    },
    pageProps,
    authDialogProps: {
      open: authDialogOpen,
      authMode,
      authForm,
      busyKeys,
      onClose: closeAuthDialog,
      onAuthModeChange: setAuthMode,
      onAuthFormChange: setAuthForm,
      onAuthSubmit: handleAuthSubmit,
    },
    toasts,
  }
}

function getAccessTokenFromResponse(response, failureMessage, operation) {
  const accessToken = toText(response?.accessToken ?? response?.access_token).trim()
  if (accessToken) {
    return accessToken
  }

  console.error(`Missing access token in ${operation} response.`, response)
  throw new Error(failureMessage)
}

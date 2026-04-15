export function readRoute() {
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

  if (cleanPath === '/wallet') {
    return { page: 'wallet' }
  }

  if (cleanPath.startsWith('/wallet/')) {
    const walletCurrency = decodeURIComponent(cleanPath.slice('/wallet/'.length)).toLowerCase()
    return ['rub', 'usdt'].includes(walletCurrency) ? { page: 'wallet', walletCurrency } : { page: 'notFound' }
  }

  if (cleanPath.startsWith('/product/')) {
    const productId = decodeURIComponent(cleanPath.slice('/product/'.length))
    return productId ? { page: 'product', productId } : { page: 'notFound' }
  }

  return { page: 'notFound' }
}

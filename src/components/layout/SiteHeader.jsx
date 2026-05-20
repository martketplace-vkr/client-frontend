export function SiteHeader({
  search,
  onSearchChange,
  onSearchSubmit,
  onOpenHome,
  onOpenFavorites,
  onOpenCart,
  onOpenAccount,
  favoriteCount,
  cartCount,
  sessionStatus,
  isAuthorized,
  profileName,
}) {
  return (
    <header className="site-header">
      <button className="brand-mark" type="button" onClick={onOpenHome}>
        <span className="brand-mark__badge">M</span>
        <span className="brand-mark__copy">
          <strong>Маркетплейс</strong>
        </span>
      </button>

      <form className="header-search" onSubmit={onSearchSubmit}>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Искать товары, бренды и категории"
          aria-label="Поиск"
        />
        <button className="button button-primary" type="submit">
          Найти
        </button>
      </form>

      <div className="header-actions">
        <button className="icon-chip" type="button" onClick={onOpenFavorites}>
          <span>Избранное</span>
          <strong>{favoriteCount}</strong>
        </button>
        <button className="icon-chip" type="button" onClick={onOpenCart}>
          <span>Корзина</span>
          <strong>{cartCount}</strong>
        </button>
        <button className={`profile-chip session-${sessionStatus}`} type="button" onClick={onOpenAccount}>
          <span>{isAuthorized ? 'Профиль' : 'Войти'}</span>
          <strong>{profileName}</strong>
        </button>
      </div>
    </header>
  )
}

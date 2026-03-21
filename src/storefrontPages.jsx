import {
  formatPrice,
  getAddressParts,
  getCategoryId,
  getProductAttributes,
  getProductDescription,
  getProductId,
  getProductName,
  getProductPrice,
  getStockCount,
  resolveProductImage,
  shortText,
  toText,
} from './helpers'
import { promoCards, serviceCards } from './marketplaceContent'
import { Field } from './ui'

export function HomePage({
  featuredProducts,
  latestProducts,
  popularCategories,
  favoriteIds,
  busyProducts,
  onCategorySelect,
  onOpenProduct,
  onToggleFavorite,
  onAddToCart,
  onGoCatalog,
}) {
  return (
    <div className="page-content">
      <section className="hero-banner surface-card surface-card-hero">
        <div className="hero-banner__copy">
          <span className="eyebrow">удобный storefront</span>
          <h1>Маркетплейс с привычной логикой покупок и чистым русским интерфейсом.</h1>
          <p>
            Главная, каталог, карточка товара, избранное, корзина и профиль уже собраны в единый пользовательский
            сценарий. Вдохновение взято у крупных маркетплейсов, но интерфейс собран в своем стиле.
          </p>

          <div className="hero-actions">
            <button className="button button-primary" type="button" onClick={onGoCatalog}>
              Перейти в каталог
            </button>
            <button className="button button-secondary" type="button" onClick={() => onCategorySelect('')}>
              Смотреть все категории
            </button>
          </div>
        </div>
      </section>

      <section className="promo-grid">
        {promoCards.map((card) => (
          <article key={card.title} className="surface-card promo-card">
            <span className="promo-card__badge">{card.badge}</span>
            <h2>{card.title}</h2>
            <p>{card.text}</p>
          </article>
        ))}
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <span className="eyebrow">категории</span>
            <h2>Популярные разделы</h2>
          </div>
          <button className="button button-ghost" type="button" onClick={onGoCatalog}>
            Весь каталог
          </button>
        </div>

        <div className="category-pills">
          {popularCategories.length === 0 ? (
            <div className="empty-panel">Категории появятся, когда API вернет дерево каталога.</div>
          ) : (
            popularCategories.map((category) => (
              <button
                key={category.value}
                className="category-pill"
                type="button"
                onClick={() => onCategorySelect(category.value)}
              >
                {category.label.trim()}
              </button>
            ))
          )}
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <span className="eyebrow">подборка</span>
            <h2>Товары дня</h2>
          </div>
          <span className="section-note">{busyProducts ? 'Загружаем каталог...' : 'Подходит для промо-блока на главной'}</span>
        </div>

        <ProductGrid
          products={featuredProducts}
          favoriteIds={favoriteIds}
          onOpenProduct={onOpenProduct}
          onToggleFavorite={onToggleFavorite}
          onAddToCart={onAddToCart}
          emptyMessage="Каталог пуст. Проверьте API или выберите другой раздел."
        />
      </section>

      <section className="service-grid">
        {serviceCards.map((card) => (
          <article key={card.title} className="surface-card service-card">
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </article>
        ))}
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <span className="eyebrow">новинки</span>
            <h2>Недавно загруженные товары</h2>
          </div>
        </div>

        <div className="mini-rail">
          {latestProducts.length === 0 ? (
            <div className="empty-panel">Пока нет товаров для нижней витрины.</div>
          ) : (
            latestProducts.map((product) => (
              <button
                key={getProductId(product)}
                className="mini-product"
                type="button"
                onClick={() => onOpenProduct(product)}
              >
                <div className="mini-product__image">
                  {resolveProductImage(product) ? (
                    <img src={resolveProductImage(product)} alt={getProductName(product)} />
                  ) : (
                    <div className="image-fallback">{getProductName(product).slice(0, 1) || '?'}</div>
                  )}
                </div>
                <div className="mini-product__copy">
                  <strong>{getProductName(product) || 'Без названия'}</strong>
                  <span>{formatPrice(getProductPrice(product))}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export function CatalogPage({
  categories,
  selectedCategoryId,
  onCategoryChange,
  search,
  onSearchChange,
  visibleProducts,
  favoriteIds,
  busyProducts,
  onReload,
  onOpenProduct,
  onToggleFavorite,
  onAddToCart,
  onResetFilters,
}) {
  return (
    <div className="page-content catalog-page">
      <section className="surface-card section-block">
        <div className="section-head">
          <div>
            <span className="eyebrow">каталог</span>
            <h1>Подберите нужный товар без лишних действий</h1>
          </div>

          <div className="section-actions">
            <button className="button button-secondary" type="button" onClick={onReload} disabled={busyProducts}>
              {busyProducts ? 'Обновляем...' : 'Обновить'}
            </button>
            <button className="button button-ghost" type="button" onClick={onResetFilters}>
              Сбросить
            </button>
          </div>
        </div>

        <div className="catalog-toolbar">
          <label className="filter-block">
            <span>Категория</span>
            <select value={selectedCategoryId} onChange={(event) => onCategoryChange(event.target.value)}>
              <option value="">Все категории</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-block">
            <span>Поиск</span>
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Например, кофеварка, наушники, стол"
            />
          </label>
        </div>
      </section>

      <ProductGrid
        products={visibleProducts}
        favoriteIds={favoriteIds}
        onOpenProduct={onOpenProduct}
        onToggleFavorite={onToggleFavorite}
        onAddToCart={onAddToCart}
        emptyMessage="Ничего не нашли. Попробуйте сменить категорию или очистить поиск."
      />
    </div>
  )
}

export function ProductPage({ product, busy, isFavorite, onBack, onToggleFavorite, onAddToCart, relatedProducts, onOpenProduct }) {
  const attributes = getProductAttributes(product)

  return (
    <div className="page-content">
      <button className="back-link" type="button" onClick={onBack}>
        Вернуться в каталог
      </button>

      {!product ? (
        <div className="surface-card empty-panel large-empty">
          {busy ? 'Загружаем карточку товара...' : 'Товар не найден или еще не загружен.'}
        </div>
      ) : (
        <section className="product-layout">
          <div className="surface-card product-gallery">
            <div className="product-gallery__main">
              {resolveProductImage(product) ? (
                <img src={resolveProductImage(product)} alt={getProductName(product)} />
              ) : (
                <div className="image-fallback large">{getProductName(product).slice(0, 1) || '?'}</div>
              )}
            </div>
          </div>

          <div className="product-summary">
            <article className="surface-card product-info">
              <span className="eyebrow">карточка товара</span>
              <h1>{getProductName(product) || 'Без названия'}</h1>
              <p>{getProductDescription(product) || 'Описание пока не добавлено.'}</p>

              <div className="meta-row">
                <span className="meta-chip">ID {getProductId(product)}</span>
                <span className="meta-chip">Категория {getCategoryId(product) || 'не указана'}</span>
                <span className="meta-chip">В наличии {getStockCount(product) || '0'}</span>
              </div>

              <div className="purchase-box">
                <div>
                  <span className="purchase-box__label">Цена</span>
                  <strong className="purchase-box__price">{formatPrice(getProductPrice(product))}</strong>
                </div>
                <div className="purchase-box__actions">
                  <button className="button button-primary" type="button" onClick={() => onAddToCart(product, 1)}>
                    В корзину
                  </button>
                  <button className="button button-secondary" type="button" onClick={() => onToggleFavorite(product)}>
                    {isFavorite ? 'Убрать из избранного' : 'В избранное'}
                  </button>
                </div>
              </div>
            </article>

            <article className="surface-card product-delivery">
              <h2>Доставка и сервис</h2>
              <ul className="clean-list">
                <li>Быстрое добавление в корзину без перезагрузки.</li>
                <li>Избранное и история просмотров сохраняются локально.</li>
                <li>После входа можно использовать сохраненные адреса доставки.</li>
              </ul>
            </article>

            <article className="surface-card product-specs">
              <h2>Характеристики</h2>
              {attributes.length === 0 ? (
                <div className="empty-panel compact-empty">Характеристики не заполнены.</div>
              ) : (
                <div className="spec-grid">
                  {attributes.map((attribute, index) => (
                    <div key={`${toText(attribute.name)}-${index}`} className="spec-item">
                      <span>{toText(attribute.name)}</span>
                      <strong>{toText(attribute.value)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </div>
        </section>
      )}

      <section className="section-block">
        <div className="section-head">
          <div>
            <span className="eyebrow">рекомендуем</span>
            <h2>Похожие товары</h2>
          </div>
        </div>

        <div className="related-grid">
          {relatedProducts.length === 0 ? (
            <div className="empty-panel">Для рекомендаций пока не хватает данных каталога.</div>
          ) : (
            relatedProducts.map((item) => (
              <button key={getProductId(item)} className="related-card" type="button" onClick={() => onOpenProduct(item)}>
                <div className="related-card__image">
                  {resolveProductImage(item) ? (
                    <img src={resolveProductImage(item)} alt={getProductName(item)} />
                  ) : (
                    <div className="image-fallback">{getProductName(item).slice(0, 1) || '?'}</div>
                  )}
                </div>
                <strong>{getProductName(item)}</strong>
                <span>{formatPrice(getProductPrice(item))}</span>
              </button>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export function FavoritesPage({ items, recentItems, onOpenProduct, onToggleFavorite, onAddToCart }) {
  return (
    <div className="page-content">
      <section className="surface-card section-block">
        <div className="section-head">
          <div>
            <span className="eyebrow">избранное</span>
            <h1>Товары, к которым хочется вернуться</h1>
          </div>
        </div>

        <ProductGrid
          products={items}
          favoriteIds={items.map((item) => getProductId(item))}
          onOpenProduct={onOpenProduct}
          onToggleFavorite={onToggleFavorite}
          onAddToCart={onAddToCart}
          emptyMessage="Пока пусто. Добавьте товары из каталога или карточки товара."
        />
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <span className="eyebrow">недавние просмотры</span>
            <h2>Недавно открывали</h2>
          </div>
        </div>

        <div className="mini-rail">
          {recentItems.length === 0 ? (
            <div className="empty-panel">История просмотров появится после открытия карточек товаров.</div>
          ) : (
            recentItems.map((item) => (
              <button key={getProductId(item)} className="mini-product" type="button" onClick={() => onOpenProduct(item)}>
                <div className="mini-product__image">
                  {resolveProductImage(item) ? (
                    <img src={resolveProductImage(item)} alt={getProductName(item)} />
                  ) : (
                    <div className="image-fallback">{getProductName(item).slice(0, 1) || '?'}</div>
                  )}
                </div>
                <div className="mini-product__copy">
                  <strong>{getProductName(item) || 'Без названия'}</strong>
                  <span>{formatPrice(getProductPrice(item))}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export function CartPage({
  items,
  total,
  totalCount,
  isAuthorized,
  addressCount,
  onOpenProduct,
  onQuantityChange,
  onRemove,
  onClearCart,
  onCheckout,
}) {
  return (
    <div className="page-content cart-layout">
      <section className="surface-card section-block">
        <div className="section-head">
          <div>
            <span className="eyebrow">корзина</span>
            <h1>Проверьте товары перед оформлением</h1>
          </div>
          <button className="button button-ghost" type="button" onClick={onClearCart} disabled={items.length === 0}>
            Очистить корзину
          </button>
        </div>

        <div className="cart-list">
          {items.length === 0 ? (
            <div className="empty-panel large-empty">Корзина пуста. Добавьте товары из каталога.</div>
          ) : (
            items.map((item) => (
              <article key={getProductId(item.snapshot)} className="cart-item">
                <button className="cart-item__media" type="button" onClick={() => onOpenProduct(item.snapshot)}>
                  {resolveProductImage(item.snapshot) ? (
                    <img src={resolveProductImage(item.snapshot)} alt={getProductName(item.snapshot)} />
                  ) : (
                    <div className="image-fallback">{getProductName(item.snapshot).slice(0, 1) || '?'}</div>
                  )}
                </button>

                <div className="cart-item__copy">
                  <button className="text-link" type="button" onClick={() => onOpenProduct(item.snapshot)}>
                    {getProductName(item.snapshot) || 'Без названия'}
                  </button>
                  <p>{shortText(getProductDescription(item.snapshot), 140) || 'Описание отсутствует.'}</p>
                  <div className="meta-row">
                    <span className="meta-chip">В наличии {getStockCount(item.snapshot) || '0'}</span>
                    <span className="meta-chip">Категория {getCategoryId(item.snapshot) || 'не указана'}</span>
                  </div>
                </div>

                <div className="cart-item__controls">
                  <QuantityStepper
                    value={item.quantity}
                    onDecrease={() => onQuantityChange(getProductId(item.snapshot), item.quantity - 1)}
                    onIncrease={() => onQuantityChange(getProductId(item.snapshot), item.quantity + 1)}
                  />
                  <strong>{formatPrice(item.lineTotal)}</strong>
                  <button className="button button-ghost" type="button" onClick={() => onRemove(getProductId(item.snapshot))}>
                    Удалить
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <aside className="surface-card checkout-card">
        <span className="eyebrow">итого</span>
        <h2>{formatPrice(total)}</h2>
        <div className="checkout-card__rows">
          <div>
            <span>Позиции</span>
            <strong>{totalCount}</strong>
          </div>
          <div>
            <span>Статус аккаунта</span>
            <strong>{isAuthorized ? 'Вход выполнен' : 'Гость'}</strong>
          </div>
          <div>
            <span>Сохраненные адреса</span>
            <strong>{addressCount}</strong>
          </div>
        </div>

        <button className="button button-primary wide-button" type="button" onClick={onCheckout}>
          Перейти к оформлению
        </button>
        <p className="checkout-note">
          UI для checkout уже подготовлен. Для реального оформления останется подключить orders API.
        </p>
      </aside>
    </div>
  )
}

export function AccountPage({
  isAuthorized,
  sessionStatus,
  authMode,
  authForm,
  profileForm,
  addressForm,
  addresses,
  busyKeys,
  cartCount,
  favoriteCount,
  onAuthModeChange,
  onAuthFormChange,
  onProfileChange,
  onAddressChange,
  onAuthSubmit,
  onProfileSubmit,
  onAddressSubmit,
  onRefreshSession,
  onLogout,
  onReloadAddresses,
}) {
  const fullName = [profileForm.firstName, profileForm.lastName].filter(Boolean).join(' ')

  return (
    <div className="page-content account-layout">
      <section className="surface-card account-overview">
        <span className="eyebrow">аккаунт</span>
        <h1>{isAuthorized ? fullName || 'Ваш профиль' : 'Войдите, чтобы сохранять адреса и продолжать покупки'}</h1>
        <p>
          Здесь собраны авторизация, профиль и адреса доставки. Личные данные продолжают работать через ваш backend
          API, а корзина и избранное доступны сразу.
        </p>

        <div className="overview-stats">
          <div className="stat-card">
            <span>Статус</span>
            <strong>{sessionStatus}</strong>
          </div>
          <div className="stat-card">
            <span>Избранное</span>
            <strong>{favoriteCount}</strong>
          </div>
          <div className="stat-card">
            <span>Корзина</span>
            <strong>{cartCount}</strong>
          </div>
        </div>
      </section>

      <div className="account-columns">
        <section className="surface-card account-panel">
          <div className="section-head">
            <div>
              <span className="eyebrow">авторизация</span>
              <h2>{authMode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}</h2>
            </div>

            <div className="toggle-group">
              <button
                className={`toggle-pill ${authMode === 'login' ? 'active' : ''}`}
                type="button"
                onClick={() => onAuthModeChange('login')}
              >
                Вход
              </button>
              <button
                className={`toggle-pill ${authMode === 'register' ? 'active' : ''}`}
                type="button"
                onClick={() => onAuthModeChange('register')}
              >
                Регистрация
              </button>
            </div>
          </div>

          <form className="form-stack" onSubmit={onAuthSubmit}>
            <Field
              label="Email"
              type="email"
              value={authForm.email}
              onChange={(event) => onAuthFormChange((current) => ({ ...current, email: event.target.value }))}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <Field
              label="Пароль"
              type="password"
              value={authForm.password}
              onChange={(event) => onAuthFormChange((current) => ({ ...current, password: event.target.value }))}
              placeholder="Введите пароль"
              autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
            />

            <div className="inline-actions">
              <button className="button button-primary" type="submit" disabled={busyKeys.auth}>
                {busyKeys.auth ? 'Подождите...' : authMode === 'login' ? 'Войти' : 'Создать аккаунт'}
              </button>
              <button className="button button-secondary" type="button" onClick={onRefreshSession} disabled={busyKeys.refresh}>
                Обновить сессию
              </button>
              <button className="button button-ghost" type="button" onClick={onLogout} disabled={!isAuthorized || busyKeys.logout}>
                Выйти
              </button>
            </div>
          </form>
        </section>

        <section className={`surface-card account-panel ${isAuthorized ? '' : 'panel-locked'}`}>
          <div className="section-head">
            <div>
              <span className="eyebrow">профиль</span>
              <h2>Личные данные</h2>
            </div>
          </div>

          <form className="form-stack" onSubmit={onProfileSubmit}>
            <div className="form-row">
              <Field
                label="Имя"
                value={profileForm.firstName}
                onChange={(event) => onProfileChange((current) => ({ ...current, firstName: event.target.value }))}
                placeholder="Анна"
                disabled={!isAuthorized}
                autoComplete="given-name"
              />
              <Field
                label="Фамилия"
                value={profileForm.lastName}
                onChange={(event) => onProfileChange((current) => ({ ...current, lastName: event.target.value }))}
                placeholder="Иванова"
                disabled={!isAuthorized}
                autoComplete="family-name"
              />
            </div>
            <Field
              label="Email"
              type="email"
              value={profileForm.email}
              onChange={(event) => onProfileChange((current) => ({ ...current, email: event.target.value }))}
              placeholder="you@example.com"
              disabled={!isAuthorized}
              autoComplete="email"
            />
            <Field
              label="Ссылка на аватар"
              value={profileForm.avatarUrl}
              onChange={(event) => onProfileChange((current) => ({ ...current, avatarUrl: event.target.value }))}
              placeholder="https://..."
              disabled={!isAuthorized}
            />

            <button className="button button-primary" type="submit" disabled={!isAuthorized || busyKeys.profile}>
              {busyKeys.profile ? 'Сохраняем...' : 'Сохранить профиль'}
            </button>
          </form>
        </section>
      </div>

      <section className={`surface-card account-panel ${isAuthorized ? '' : 'panel-locked'}`}>
        <div className="section-head">
          <div>
            <span className="eyebrow">адреса</span>
            <h2>Адреса доставки</h2>
          </div>
          <button className="button button-secondary" type="button" onClick={onReloadAddresses} disabled={!isAuthorized || busyKeys.addresses}>
            Обновить адреса
          </button>
        </div>

        <form className="form-stack" onSubmit={onAddressSubmit}>
          <div className="form-row">
            <Field
              label="Страна"
              value={addressForm.country}
              onChange={(event) => onAddressChange((current) => ({ ...current, country: event.target.value }))}
              placeholder="Россия"
              disabled={!isAuthorized}
              autoComplete="country-name"
            />
            <Field
              label="Город"
              value={addressForm.city}
              onChange={(event) => onAddressChange((current) => ({ ...current, city: event.target.value }))}
              placeholder="Москва"
              disabled={!isAuthorized}
              autoComplete="address-level2"
            />
          </div>
          <Field
            label="Улица"
            value={addressForm.street}
            onChange={(event) => onAddressChange((current) => ({ ...current, street: event.target.value }))}
            placeholder="ул. Ленина, 10"
            disabled={!isAuthorized}
            autoComplete="street-address"
          />
          <Field
            label="Индекс"
            value={addressForm.postalCode}
            onChange={(event) => onAddressChange((current) => ({ ...current, postalCode: event.target.value }))}
            placeholder="101000"
            disabled={!isAuthorized}
            autoComplete="postal-code"
          />

          <button className="button button-primary" type="submit" disabled={!isAuthorized || busyKeys.address}>
            {busyKeys.address ? 'Добавляем...' : 'Добавить адрес'}
          </button>
        </form>

        <div className="address-grid">
          {addresses.length === 0 ? (
            <div className="empty-panel compact-empty">Адресов пока нет.</div>
          ) : (
            addresses.map((address, index) => (
              <article key={`${toText(address.id)}-${index}`} className="address-tile">
                <strong>{getAddressParts(address).slice(0, 2).join(', ') || 'Адрес'}</strong>
                <span>{getAddressParts(address).join(', ')}</span>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export function AuthDialog({
  open,
  authMode,
  authForm,
  busyKeys,
  onClose,
  onAuthModeChange,
  onAuthFormChange,
  onAuthSubmit,
}) {
  if (!open) {
    return null
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <section
        className="surface-card modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" aria-label="Закрыть окно входа" onClick={onClose}>
          ×
        </button>

        <div className="modal-copy">
          <span className="eyebrow">вход в аккаунт</span>
          <h2 id="auth-dialog-title">{authMode === 'login' ? 'Авторизация' : 'Регистрация'}</h2>
          <p>Профиль доступен только авторизованным пользователям. Войдите, чтобы открыть личный кабинет.</p>
        </div>

        <div className="toggle-group">
          <button
            className={`toggle-pill ${authMode === 'login' ? 'active' : ''}`}
            type="button"
            onClick={() => onAuthModeChange('login')}
          >
            Вход
          </button>
          <button
            className={`toggle-pill ${authMode === 'register' ? 'active' : ''}`}
            type="button"
            onClick={() => onAuthModeChange('register')}
          >
            Регистрация
          </button>
        </div>

        <form className="form-stack" onSubmit={onAuthSubmit}>
          <Field
            label="Email"
            type="email"
            value={authForm.email}
            onChange={(event) => onAuthFormChange((current) => ({ ...current, email: event.target.value }))}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Field
            label="Пароль"
            type="password"
            value={authForm.password}
            onChange={(event) => onAuthFormChange((current) => ({ ...current, password: event.target.value }))}
            placeholder="Введите пароль"
            autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
          />

          <button className="button button-primary wide-button" type="submit" disabled={busyKeys.auth}>
            {busyKeys.auth ? 'Подождите...' : authMode === 'login' ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>
      </section>
    </div>
  )
}

export function NotFoundPage({ onGoHome }) {
  return (
    <div className="page-content">
      <section className="surface-card empty-panel large-empty">
        <h1>Страница не найдена</h1>
        <p>Такого раздела нет в текущем storefront.</p>
        <button className="button button-primary" type="button" onClick={onGoHome}>
          На главную
        </button>
      </section>
    </div>
  )
}

function ProductGrid({ products, favoriteIds, onOpenProduct, onToggleFavorite, onAddToCart, emptyMessage }) {
  if (products.length === 0) {
    return <div className="surface-card empty-panel large-empty">{emptyMessage}</div>
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={getProductId(product)}
          product={product}
          isFavorite={favoriteIds.includes(getProductId(product))}
          onOpen={onOpenProduct}
          onToggleFavorite={onToggleFavorite}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  )
}

function ProductCard({ product, isFavorite, onOpen, onToggleFavorite, onAddToCart }) {
  return (
    <article className="surface-card product-card">
      <button className="product-card__media" type="button" onClick={() => onOpen(product)}>
        {resolveProductImage(product) ? (
          <img src={resolveProductImage(product)} alt={getProductName(product)} />
        ) : (
          <div className="image-fallback">{getProductName(product).slice(0, 1) || '?'}</div>
        )}
      </button>

      <div className="product-card__body">
        <span className="product-card__meta">Категория {getCategoryId(product) || 'не указана'}</span>
        <button className="text-link text-link-title" type="button" onClick={() => onOpen(product)}>
          {getProductName(product) || 'Без названия'}
        </button>
        <p>{shortText(getProductDescription(product), 110) || 'Описание пока не добавлено.'}</p>
      </div>

      <div className="product-card__footer">
        <div>
          <strong>{formatPrice(getProductPrice(product))}</strong>
          <span>В наличии: {getStockCount(product) || '0'}</span>
        </div>

        <div className="card-actions">
          <button className="button button-primary button-small" type="button" onClick={() => onAddToCart(product, 1)}>
            В корзину
          </button>
          <button className="button button-ghost button-small" type="button" onClick={() => onToggleFavorite(product)}>
            {isFavorite ? 'Убрать' : 'Лайк'}
          </button>
        </div>
      </div>
    </article>
  )
}

function QuantityStepper({ value, onDecrease, onIncrease }) {
  return (
    <div className="qty-stepper">
      <button type="button" onClick={onDecrease} aria-label="Уменьшить количество">
        -
      </button>
      <strong>{value}</strong>
      <button type="button" onClick={onIncrease} aria-label="Увеличить количество">
        +
      </button>
    </div>
  )
}

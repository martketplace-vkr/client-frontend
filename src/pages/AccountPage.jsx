import { useState } from 'react'
import { ProductGrid } from '../components/storefront/ProductSections'
import {
  compactStatus,
  copyText,
  formatDateTime,
  formatPrice,
  getAddressParts,
  getProductId,
  getProductName,
  resolveProductImage,
  toText,
} from '../helpers'
import { Field, FileUploadField } from '../ui'

const ACCOUNT_NAV_ITEMS = [
  { id: 'personal', label: 'Личные данные', icon: 'user' },
  { id: 'delivery', label: 'Доставка', icon: 'bag' },
  { id: 'orders', label: 'Заказы', icon: 'box' },
  { id: 'reviews', label: 'Отзывы', icon: 'star' },
  { id: 'wallet', label: 'Кошелек', icon: 'card' },
  { id: 'favorites', label: 'Избранное', icon: 'heart' },
]

export function AccountPage({
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
  onProfileChange,
  onAvatarUpload,
  onAddressChange,
  onProfileSubmit,
  onAddressSubmit,
  onCancelOrder,
  onReloadDashboard,
  onLogout,
  onReloadAddresses,
  onOpenProduct,
  onToggleFavorite,
  onAddToCart,
  hasPrivateData,
  reviewSummaries,
  myProductReviews,
  reviewForm,
  onReviewFormChange,
  onReviewImageUpload,
  onRemoveReviewImage,
  onReviewSubmit,
}) {
  const [activeNavItem, setActiveNavItem] = useState('personal')

  function handleAccountNav(item) {
    setActiveNavItem(item.id)
  }

  return (
    <div className="page-content account-layout">
      <div className="account-shell">
        <aside className="account-sidebar" aria-label="Навигация профиля">
          <nav className="account-menu">
            {ACCOUNT_NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`account-menu__item ${activeNavItem === item.id ? 'active' : ''}`}
                type="button"
                onClick={() => handleAccountNav(item)}
              >
                <AccountNavIcon name={item.icon} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="account-main">
          {activeNavItem === 'personal' ? (
            <PersonalSection
              isAuthorized={isAuthorized}
              sessionStatus={sessionStatus}
              profileForm={profileForm}
              busyKeys={busyKeys}
              onProfileChange={onProfileChange}
              onAvatarUpload={onAvatarUpload}
              onProfileSubmit={onProfileSubmit}
              onReloadDashboard={onReloadDashboard}
              onLogout={onLogout}
              hasPrivateData={hasPrivateData}
            />
          ) : null}

          {activeNavItem === 'delivery' ? (
            <DeliverySection
              isAuthorized={isAuthorized}
              addressForm={addressForm}
              addresses={addresses}
              busyKeys={busyKeys}
              onAddressChange={onAddressChange}
              onAddressSubmit={onAddressSubmit}
              onReloadAddresses={onReloadAddresses}
            />
          ) : null}

          {activeNavItem === 'orders' ? (
            <OrdersSection
              isAuthorized={isAuthorized}
              orders={orders}
              busyKeys={busyKeys}
              onCancelOrder={onCancelOrder}
              onOpenProduct={onOpenProduct}
              reviewForm={reviewForm}
              myProductReviews={myProductReviews}
              onReviewFormChange={onReviewFormChange}
              onReviewImageUpload={onReviewImageUpload}
              onRemoveReviewImage={onRemoveReviewImage}
              onReviewSubmit={onReviewSubmit}
            />
          ) : null}

          {activeNavItem === 'reviews' ? (
            <AccountReviewsSection
              isAuthorized={isAuthorized}
              orders={orders}
              busyKeys={busyKeys}
              reviewForm={reviewForm}
              myProductReviews={myProductReviews}
              onOpenProduct={onOpenProduct}
              onReviewFormChange={onReviewFormChange}
              onReviewImageUpload={onReviewImageUpload}
              onRemoveReviewImage={onRemoveReviewImage}
              onReviewSubmit={onReviewSubmit}
            />
          ) : null}

          {activeNavItem === 'wallet' ? (
            <AccountWalletSection
              isAuthorized={isAuthorized}
              wallet={wallet}
              depositAddresses={depositAddresses}
              transactions={transactions}
              topUps={topUps}
              busyKeys={busyKeys}
              onReloadDashboard={onReloadDashboard}
              hasPrivateData={hasPrivateData}
            />
          ) : null}

          {activeNavItem === 'favorites' ? (
            <AccountFavoritesSection
              favoriteItems={favoriteItems}
              reviewSummaries={reviewSummaries}
              onOpenProduct={onOpenProduct}
              onToggleFavorite={onToggleFavorite}
              onAddToCart={onAddToCart}
            />
          ) : null}
        </main>
      </div>
    </div>
  )
}

function PersonalSection({
  isAuthorized,
  profileForm,
  busyKeys,
  onProfileChange,
  onAvatarUpload,
  onProfileSubmit,
  onReloadDashboard,
  onLogout,
  hasPrivateData,
}) {
  return (
    <section className={`surface-card account-panel ${isAuthorized ? '' : 'panel-locked'}`}>
      <div className="section-head">
        <div>
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
          placeholder="you@example.com"
          disabled={!isAuthorized}
          readOnly
          autoComplete="email"
        />
        <FileUploadField
          label="Загрузить аватар"
          accept="image/*"
          onChange={onAvatarUpload}
          disabled={!isAuthorized || busyKeys.mediaAvatar}
          busy={busyKeys.mediaAvatar}
          hint="После загрузки ссылка появится в поле аватара."
        />

        <div className="inline-actions">
          <button className="button button-primary" type="submit" disabled={!isAuthorized || busyKeys.profile}>
            {busyKeys.profile ? 'Сохраняем...' : 'Сохранить профиль'}
          </button>
          <button className="button button-secondary" type="button" onClick={onReloadDashboard} disabled={!hasPrivateData || busyKeys.dashboard}>
            {busyKeys.dashboard ? 'Обновляем...' : 'Обновить'}
          </button>
          <button className="button button-ghost" type="button" onClick={onLogout} disabled={!isAuthorized || busyKeys.logout}>
            Выйти
          </button>
        </div>
      </form>
    </section>
  )
}

function DeliverySection({
  isAuthorized,
  addressForm,
  addresses,
  busyKeys,
  onAddressChange,
  onAddressSubmit,
  onReloadAddresses,
}) {
  return (
    <section className={`surface-card account-panel ${isAuthorized ? '' : 'panel-locked'}`}>
      <div className="section-head">
        <div>
          <h2>Доставка</h2>
        </div>
        <button
          className="button button-secondary"
          type="button"
          onClick={onReloadAddresses}
          disabled={!isAuthorized || busyKeys.addresses}
        >
          Обновить
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
  )
}

function OrdersSection({
  isAuthorized,
  orders,
  busyKeys,
  onCancelOrder,
  onOpenProduct,
  reviewForm,
  myProductReviews = {},
  onReviewFormChange,
  onReviewImageUpload,
  onRemoveReviewImage,
  onReviewSubmit,
}) {
  const orderGroups = groupOrders(orders)
  const [reviewTarget, setReviewTarget] = useState(null)

  function openReviewForm(target, review) {
    setReviewTarget(target)
    onReviewFormChange?.(reviewToForm(review))
  }

  function closeReviewForm() {
    setReviewTarget(null)
  }

  async function submitReview(event) {
    const saved = await onReviewSubmit(event, reviewTarget?.productId)
    if (saved) {
      closeReviewForm()
    }
  }

  return (
    <section className={`surface-card account-panel ${isAuthorized ? '' : 'panel-locked'}`}>
      <div className="section-head">
        <div>
          <h2>История заказов</h2>
        </div>
      </div>

      <div className="order-history">
        {orderGroups.length === 0 ? (
          <div className="empty-panel compact-empty">Заказов пока нет.</div>
        ) : (
          orderGroups.map((group) => {
            const cancellableOrders = group.items.filter(canCancelOrder)
            const isCancelling = group.items.some((order) => busyKeys[`order-${getOrderId(order)}`])

            return (
              <article key={group.key} className="order-card">
                <div className="order-card__top">
                  <div className="order-card__title">
                    <h3>
                      {getOrderStatusLabel(group.status)} {formatOrderDay(group.createdAt)}
                    </h3>
                    <span>{getOrderSubtitle(group)}</span>
                  </div>
                  <div className="order-card__meta">
                    <span className={`order-status-pill status-${normalizeStatus(group.status)}`}>
                      {getOrderStatusLabel(group.status)}
                    </span>
                    <span>{getOrderCode(group)}</span>
                  </div>
                </div>

                <div className="order-card__body">
                  <div className="order-card__summary">
                    <span>Сумма заказа</span>
                    <strong>{getOrderGroupTotal(group)}</strong>
                    <small>{group.items.length} {pluralizeProducts(group.items.length)}</small>
                    <button
                      className="button button-ghost button-small"
                      type="button"
                      onClick={() => cancellableOrders.forEach((order) => onCancelOrder(getOrderId(order)))}
                      disabled={!isAuthorized || isCancelling || cancellableOrders.length === 0}
                    >
                      {isCancelling ? 'Отменяем...' : 'Отменить заказ'}
                    </button>
                  </div>

                  <div className="order-product-grid">
                    {group.items.map((order, index) => {
                      const product = buildOrderProduct(order)
                      const productId = getProductId(product)
                      const productName = getProductName(product) || 'Товар'
                      const imageUrl = resolveProductImage(product)
                      const quantity = getOrderQuantity(order)
                      const unitPrice = getOrderUnitPrice(order)
                      const lineTotal = getOrderLineTotal(order)
                      const tileKey = `${getOrderId(order)}-${productId || index}`
                      const canReviewProduct = canReviewOrder(order) && Boolean(productId)
                      const myReview = productId ? myProductReviews[productId] : null
                      const hasMyReview = Boolean(myReview)

                      return (
                        <article
                          key={tileKey}
                          className={`order-product-tile ${productId ? '' : 'order-product-tile--disabled'}`}
                        >
                          <button
                            className="order-product-tile__open"
                            type="button"
                            onClick={() => onOpenProduct(product)}
                            disabled={!productId}
                            aria-label={`Открыть карточку ${productName}`}
                          >
                            <span className="order-product-tile__image">
                              {imageUrl ? (
                                <img src={imageUrl} alt={productName} />
                              ) : (
                                <span className="image-fallback">{productName.slice(0, 1) || '?'}</span>
                              )}
                            </span>
                            <strong className="order-product-tile__name">{productName}</strong>
                            <dl className="order-product-tile__details">
                              <div>
                                <dt>Кол-во</dt>
                                <dd>{quantity}</dd>
                              </div>
                              <div>
                                <dt>За единицу</dt>
                                <dd>{formatPrice(unitPrice)}</dd>
                              </div>
                              <div className="order-product-tile__line-total">
                                <dt>За товар</dt>
                                <dd>{formatPrice(lineTotal)}</dd>
                              </div>
                            </dl>
                          </button>

                          {canReviewProduct ? (
                            <div className="order-product-review">
                              {hasMyReview ? (
                                <span className="order-product-review__status">
                                  Отзыв оставлен <b>★ {toText(myReview.rating)}</b>
                                </span>
                              ) : null}
                              <button
                                className="button button-secondary button-small"
                                type="button"
                                onClick={() => openReviewForm({ productId, productName, mode: hasMyReview ? 'update' : 'create' }, myReview)}
                              >
                                {hasMyReview ? 'Изменить отзыв' : 'Оставить отзыв'}
                              </button>
                            </div>
                          ) : null}
                        </article>
                      )
                    })}
                  </div>
                </div>
              </article>
            )
          })
        )}
      </div>

      {reviewTarget ? (
        <div
          className="modal-overlay review-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeReviewForm()
            }
          }}
        >
          <div className="surface-card modal-card review-modal-card" role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
            <button className="modal-close" type="button" onClick={closeReviewForm} aria-label="Закрыть">
              ×
            </button>
            <OrderReviewForm
              productName={reviewTarget.productName}
              mode={reviewTarget.mode}
              form={reviewForm}
              busyKeys={busyKeys}
              onChange={onReviewFormChange}
              onImageUpload={onReviewImageUpload}
              onRemoveImage={onRemoveReviewImage}
              onSubmit={submitReview}
              onCancel={closeReviewForm}
            />
          </div>
        </div>
      ) : null}
    </section>
  )
}

function OrderReviewForm({
  productName,
  mode = 'create',
  form = { rating: 5, comment: '', imageUrls: [] },
  busyKeys,
  onChange,
  onImageUpload,
  onRemoveImage,
  onSubmit,
  onCancel,
}) {
  const imageUrls = Array.isArray(form.imageUrls) ? form.imageUrls : []

  return (
    <form className="review-form order-review-form" onSubmit={onSubmit}>
      <div className="review-form__top">
        <div>
          <strong id="review-modal-title">Отзыв о товаре</strong>
          {productName ? <span>{productName}</span> : null}
        </div>
        <StarInput value={form.rating} onChange={(rating) => onChange?.({ rating })} />
      </div>

      <textarea
        className="review-textarea"
        rows={4}
        value={form.comment}
        onChange={(event) => onChange?.({ comment: event.target.value })}
        placeholder="Расскажите, что понравилось или не понравилось"
        required
      />

      {imageUrls.length > 0 ? (
        <div className="review-preview-grid">
          {imageUrls.map((imageUrl) => (
            <button
              key={imageUrl}
              className="review-preview"
              type="button"
              onClick={() => onRemoveImage?.(imageUrl)}
              aria-label="Удалить фото из отзыва"
            >
              <img src={imageUrl} alt="" />
              <span>Удалить</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="inline-actions">
        <label className={`review-upload ${busyKeys.reviewImages || imageUrls.length >= 6 ? 'disabled' : ''}`}>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onImageUpload}
            disabled={busyKeys.reviewImages || imageUrls.length >= 6}
          />
          {busyKeys.reviewImages ? 'Загружаем...' : 'Добавить фото'}
        </label>
        <button className="button button-primary button-small" type="submit" disabled={busyKeys.reviewSubmit}>
          {busyKeys.reviewSubmit ? 'Сохраняем...' : mode === 'update' ? 'Обновить отзыв' : 'Опубликовать'}
        </button>
        <button className="button button-ghost button-small" type="button" onClick={onCancel}>
          Отмена
        </button>
      </div>
    </form>
  )
}

function reviewToForm(review) {
  if (!review) {
    return { rating: 5, comment: '', imageUrls: [] }
  }

  const images = Array.isArray(review.images) ? review.images : []

  return {
    rating: Number.parseInt(review.rating, 10) || 5,
    comment: toText(review.comment),
    imageUrls: images.map((image) => toText(image?.url)).filter(Boolean),
  }
}

function StarInput({ value, onChange }) {
  const rating = Number.parseInt(value, 10) || 5

  return (
    <div className="star-input" aria-label="Оценка товара">
      {[1, 2, 3, 4, 5].map((item) => (
        <button
          key={item}
          className={item <= rating ? 'active' : ''}
          type="button"
          onClick={() => onChange?.(item)}
          aria-label={`${item} из 5`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function AccountReviewsSection({
  isAuthorized,
  orders,
  busyKeys,
  reviewForm,
  myProductReviews = {},
  onOpenProduct,
  onReviewFormChange,
  onReviewImageUpload,
  onRemoveReviewImage,
  onReviewSubmit,
}) {
  const reviews = buildMyReviewItems(orders, myProductReviews)
  const [reviewTarget, setReviewTarget] = useState(null)

  function openReviewEditor(product, review) {
    const productId = toText(review?.product_id ?? review?.productId ?? getProductId(product))
    const productName = getProductName(product) || `Товар #${productId}`

    setReviewTarget({ productId, productName, mode: 'update' })
    onReviewFormChange?.(reviewToForm(review))
  }

  function closeReviewEditor() {
    setReviewTarget(null)
  }

  async function submitReview(event) {
    const saved = await onReviewSubmit(event, reviewTarget?.productId)
    if (saved) {
      closeReviewEditor()
    }
  }

  return (
    <section className={`surface-card account-panel ${isAuthorized ? '' : 'panel-locked'}`}>
      <div className="section-head">
        <div>
          <h2>Мои отзывы</h2>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="empty-panel compact-empty">Вы пока не оставляли отзывы.</div>
      ) : (
        <div className="account-review-list">
          {reviews.map(({ product, review }) => {
            const productName = getProductName(product) || `Товар #${toText(review.product_id ?? review.productId)}`
            const imageUrl = resolveProductImage(product)
            const images = Array.isArray(review.images) ? review.images : []

            return (
              <article key={toText(review.id)} className="account-review-card">
                <button className="account-review-card__product" type="button" onClick={() => onOpenProduct(product)}>
                  <span className="account-review-card__image">
                    {imageUrl ? <img src={imageUrl} alt={productName} /> : <span className="image-fallback">{productName.slice(0, 1) || '?'}</span>}
                  </span>
                  <span>
                    <strong>{productName}</strong>
                    <small>{formatDateTime(review.updated_at ?? review.updatedAt ?? review.created_at ?? review.createdAt)}</small>
                  </span>
                </button>

                <div className="account-review-card__body">
                  <div className="account-review-card__rating" aria-label={`${toText(review.rating)} из 5`}>
                    {[1, 2, 3, 4, 5].map((item) => (
                      <span key={item} className={item <= Number.parseInt(review.rating, 10) ? 'active' : ''}>★</span>
                    ))}
                  </div>
                  <p>{toText(review.comment)}</p>

                  {images.length > 0 ? (
                    <div className="account-review-card__images">
                      {images.map((image, index) => (
                        <img key={`${toText(image?.url)}-${index}`} src={toText(image?.url)} alt="" />
                      ))}
                    </div>
                  ) : null}

                  <div className="account-review-card__actions">
                    <button
                      className="button button-secondary button-small"
                      type="button"
                      onClick={() => openReviewEditor(product, review)}
                    >
                      Изменить отзыв
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {reviewTarget ? (
        <div
          className="modal-overlay review-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeReviewEditor()
            }
          }}
        >
          <div className="surface-card modal-card review-modal-card" role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
            <button className="modal-close" type="button" onClick={closeReviewEditor} aria-label="Закрыть">
              ×
            </button>
            <OrderReviewForm
              productName={reviewTarget.productName}
              mode={reviewTarget.mode}
              form={reviewForm}
              busyKeys={busyKeys}
              onChange={onReviewFormChange}
              onImageUpload={onReviewImageUpload}
              onRemoveImage={onRemoveReviewImage}
              onSubmit={submitReview}
              onCancel={closeReviewEditor}
            />
          </div>
        </div>
      ) : null}
    </section>
  )
}

function AccountWalletSection({
  isAuthorized,
  wallet,
  depositAddresses = [],
  transactions = [],
  topUps = [],
  busyKeys,
  onReloadDashboard,
  hasPrivateData,
}) {
  const wallets = buildAccountWallets(wallet, depositAddresses, topUps)
  const [selectedCurrency, setSelectedCurrency] = useState('')
  const selectedWallet = wallets.find((item) => item.currency === selectedCurrency)

  if (selectedWallet) {
    const isUsdt = selectedWallet.currency === 'usdt'

    return (
      <div className="account-wallet-detail-stack">
        <section className={`surface-card wallet-detail-card ${isAuthorized ? '' : 'panel-locked'}`}>
          <div className="wallet-detail__top">
            <button className="back-link" type="button" onClick={() => setSelectedCurrency('')}>
              Назад к кошелькам
            </button>
            <div className="wallet-detail__identity">
              <span className={`wallet-icon wallet-icon-${selectedWallet.tone} wallet-icon-compact`}>
                {selectedWallet.icon}
                {isUsdt ? <i>T</i> : null}
              </span>
              <strong>{isUsdt ? 'USDT TRC-20' : 'RUB'}</strong>
              {isUsdt ? <span className="wallet-network-pill">TRC-20</span> : null}
              {isUsdt && selectedWallet.address ? (
                <button className="wallet-address-pill copy-pill" type="button" onClick={() => void copyText(selectedWallet.address)}>
                  {shortAddress(selectedWallet.address)}
                </button>
              ) : null}
            </div>
            <button className="button button-secondary button-small" type="button" onClick={onReloadDashboard} disabled={!hasPrivateData || busyKeys.dashboard}>
              Обновить
            </button>
          </div>

          <div className="wallet-detail__balance">
            <strong>
              {selectedWallet.amount} <span>{selectedWallet.title}</span>
            </strong>
          </div>

          <div className="wallet-actions">
            <button className="wallet-action" type="button" disabled={!isAuthorized || isUsdt}>
              Пополнить
            </button>
            <button className="wallet-action" type="button" disabled={!isAuthorized || isUsdt}>
              Вывести
            </button>
            {isUsdt ? (
              <button className="wallet-action" type="button" disabled>
                Обменять
              </button>
            ) : null}
          </div>
        </section>

        {isUsdt ? (
          <section className="surface-card wallet-info-card">
    
            <h2>USDT TRC-20</h2>
            <div className="wallet-address-box">
              <code>{selectedWallet.address || 'Адрес еще не создан.'}</code>
              <button className="button button-secondary button-small" type="button" onClick={() => void copyText(selectedWallet.address)} disabled={!selectedWallet.address}>
                Скопировать
              </button>
            </div>
          </section>
        ) : null}

        {isUsdt ? (
          <section className="surface-card wallet-info-card">
      
            <h2>Последние операции</h2>
            <div className="account-list">
              {transactions.length === 0 ? (
                <div className="empty-panel compact-empty">Транзакций пока нет.</div>
              ) : (
                transactions.map((transaction) => (
                  <article key={toText(transaction.id)} className="account-row transaction-row">
                    <div>
                      <strong>{compactStatus(transaction.type)}</strong>
                      <span>{transaction.reason || transaction.referenceId || transaction.reference_id || 'Операция по кошельку'}</span>
                    </div>
                    <div>
                      <strong>{compactStatus(transaction.status)}</strong>
                      <span>{formatDateTime(transaction.postedAt ?? transaction.posted_at ?? transaction.createdAt ?? transaction.created_at)}</span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        ) : null}
      </div>
    )
  }

  return (
    <section className={`surface-card account-panel ${isAuthorized ? '' : 'panel-locked'}`}>
      <div className="section-head">
        <div>
        </div>
      </div>

      <div className="wallet-card-list account-wallet-list">
        {wallets.map((item) => (
          <button
            key={item.currency}
            className="wallet-card surface-card account-wallet-card"
            type="button"
            onClick={() => setSelectedCurrency(item.currency)}
            disabled={!isAuthorized}
          >
            <span className={`wallet-icon wallet-icon-${item.tone}`}>
              {item.icon}
              {item.currency === 'usdt' ? <i>T</i> : null}
            </span>
            <span className="wallet-card__content">
              <span className="wallet-card__amount">
                {item.amount} <b>{item.title}</b>
              </span>
              <span className="wallet-card__subtitle">{item.subtitle}</span>
            </span>
            {item.address ? <span className="wallet-address-pill">{shortAddress(item.address)}</span> : null}
          </button>
        ))}
      </div>
    </section>
  )
}

function AccountFavoritesSection({ favoriteItems, reviewSummaries, onOpenProduct, onToggleFavorite, onAddToCart }) {
  return (
    <section className="surface-card account-panel">
      <div className="section-head">
        <div>
          <h2>Избранные товары</h2>
        </div>
      </div>

      <ProductGrid
        products={favoriteItems}
        favoriteIds={favoriteItems.map((item) => getProductId(item))}
        onOpenProduct={onOpenProduct}
        onToggleFavorite={onToggleFavorite}
        onAddToCart={onAddToCart}
        reviewSummaries={reviewSummaries}
        emptyMessage="Пока пусто. Добавьте товары из каталога или карточки товара."
      />
    </section>
  )
}

function buildAccountWallets(wallet, depositAddresses, topUps) {
  return [
    {
      currency: 'rub',
      title: 'RUB',
      subtitle: 'Рублевый кошелек',
      icon: 'R',
      amount: getAccountBalance(wallet, 1000, '0.00'),
      tone: 'rub',
    },
    {
      currency: 'usdt',
      title: 'USDT',
      subtitle: 'USDT TRC-20',
      icon: 'U',
      amount: getAccountBalance(wallet, 2001, '0.00'),
      tone: 'usdt',
      address: resolveDepositAddress(depositAddresses, topUps),
    },
  ]
}

function getAccountBalance(wallet, currencyCode, fallback) {
  const targetCurrencyCode = toText(currencyCode)
  const account = wallet?.accounts?.find(
    (item) =>
      toText(item?.currencyCode ?? item?.currency_code) === targetCurrencyCode &&
      toText(item?.accountType ?? item?.account_type).includes('AVAILABLE'),
  )
  const parsed = Number.parseFloat(toText(account?.balance ?? fallback).replace(',', '.'))

  return Number.isFinite(parsed) ? parsed.toFixed(2) : fallback
}

function resolveDepositAddress(depositAddresses, topUps) {
  const depositAddress = depositAddresses.find((address) => address.address)
  const latestAddress = topUps.find((topUp) => topUp.walletAddress || topUp.wallet_address)

  return depositAddress?.address || latestAddress?.walletAddress || latestAddress?.wallet_address || ''
}

function shortAddress(address) {
  const value = toText(address)
  if (value.length <= 10) {
    return value
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`
}

function AccountNavIcon({ name }) {
  const icons = {
    user: (
      <>
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
      </>
    ),
    bag: (
      <>
        <path d="M6 8h12l-1 12H7L6 8Z" />
        <path d="M9 8a3 3 0 0 1 6 0" />
      </>
    ),
    box: (
      <>
        <path d="m4 7 8-4 8 4-8 4-8-4Z" />
        <path d="M4 7v10l8 4 8-4V7" />
        <path d="M12 11v10" />
      </>
    ),
    card: (
      <>
        <path d="M4 7h16v10H4V7Z" />
        <path d="M4 10h16" />
        <path d="M7 15h4" />
      </>
    ),
    heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />,
    star: <path d="m12 4 2.4 5 5.5.8-4 3.9.9 5.5-4.8-2.6-4.8 2.6.9-5.5-4-3.9 5.5-.8L12 4Z" />,
  }

  return (
    <svg className="account-menu__icon" viewBox="0 0 24 24" aria-hidden="true">
      {icons[name]}
    </svg>
  )
}

const ORDER_STATUS_LABELS = {
  created: 'Создан',
  waiting_for_payment: 'Ожидает оплаты',
  assembly: 'Собирается',
  delivery_to_pick_up: 'Едет в пункт выдачи',
  delivery_to_client: 'Едет к вам',
  waiting_pick_up: 'Ждет получения',
  success: 'Получен',
  cancelled: 'Отменен',
  canceled: 'Отменен',
  cancelled_by_client: 'Отменен',
  cancelled_by_seller: 'Отменен продавцом',
  canecelled_by_client: 'Отменен',
  canecelled_by_seller: 'Отменен продавцом',
}

function groupOrders(orders) {
  const groups = new Map()

  for (const order of orders) {
    const checkoutID = getOrderCheckoutId(order)
    const createdAt = getOrderCreatedAt(order)
    const dateKey = toDateKey(createdAt)
    const key = checkoutID || (dateKey ? `date-${dateKey}` : `order-${getOrderId(order)}`)

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        checkoutID,
        createdAt,
        status: order?.status,
        items: [],
      })
    }

    groups.get(key).items.push(order)
  }

  return Array.from(groups.values()).map((group) => ({
    ...group,
    status: resolveGroupStatus(group.items),
    createdAt: group.createdAt || getOrderCreatedAt(group.items[0]),
    items: group.items.sort((a, b) => Number.parseInt(getOrderId(a), 10) - Number.parseInt(getOrderId(b), 10)),
  }))
}

function resolveGroupStatus(orders) {
  if (orders.length === 0) {
    return ''
  }

  const statuses = orders.map((order) => normalizeStatus(order?.status)).filter(Boolean)
  const uniqueStatuses = new Set(statuses)

  if (uniqueStatuses.size === 1) {
    return statuses[0]
  }

  if (statuses.some((status) => status.includes('cancel'))) {
    return 'cancelled'
  }

  return orders[0]?.status || ''
}

function getOrderId(order) {
  return toText(order?.id ?? order?.orderId ?? order?.order_id)
}

function getOrderCheckoutId(order) {
  return toText(order?.checkoutId ?? order?.checkout_id)
}

function getOrderCreatedAt(order) {
  return order?.createdAt ?? order?.created_at ?? order?.updatedAt ?? order?.updated_at ?? ''
}

function getOrderStatusLabel(status) {
  const normalized = normalizeStatus(status)
  return ORDER_STATUS_LABELS[normalized] || compactStatus(status)
}

function normalizeStatus(status) {
  return toText(status).trim().toLowerCase().replace(/^[a-z_]+_status_/, '').replace(/[^a-z0-9_]+/g, '_')
}

function getOrderSubtitle(group) {
  const totalQuantity = group.items.reduce((sum, order) => sum + getOrderQuantity(order), 0)
  const dateTime = formatDateTime(group.createdAt)

  return `${totalQuantity} ${pluralizeProducts(totalQuantity)} • ${dateTime}`
}

function getOrderCode(group) {
  if (group.checkoutID) {
    return group.checkoutID
  }

  const ids = group.items.map(getOrderId).filter(Boolean)
  if (ids.length === 0) {
    return 'без номера'
  }

  if (ids.length === 1) {
    return `#${ids[0]}`
  }

  return `#${ids[0]}-${ids[ids.length - 1]}`
}

function formatOrderDay(value) {
  const date = parseOrderDate(value)
  if (!date) {
    return ''
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
  }).format(date)
}

function toDateKey(value) {
  const date = parseOrderDate(value)
  if (!date) {
    return ''
  }

  return date.toISOString()
}

function parseOrderDate(value) {
  if (!value) {
    return null
  }

  if (typeof value === 'object' && value.seconds) {
    const date = new Date(Number(value.seconds) * 1000)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function buildOrderProduct(order) {
  const product = order?.product || {}
  const productID = toText(product.productId ?? product.product_id ?? order?.productId ?? order?.product_id)
  const imageURL = toText(product.imageUrl ?? product.image_url ?? order?.productImageUrl ?? order?.product_image_url)

  return {
    id: productID,
    productId: productID,
    vendorId: toText(order?.vendorId ?? order?.vendor_id),
    name: toText(product.productName ?? product.product_name ?? order?.productName ?? order?.product_name),
    price: getOrderUnitPrice(order),
    images: imageURL ? [{ url: imageURL, is_main: true }] : [],
  }
}

function buildMyReviewItems(orders, myProductReviews) {
  const productsById = new Map()

  for (const order of orders || []) {
    const product = buildOrderProduct(order)
    const productId = getProductId(product)
    if (productId && !productsById.has(productId)) {
      productsById.set(productId, product)
    }
  }

  return Object.entries(myProductReviews || {})
    .filter(([, review]) => review)
    .map(([productId, review]) => ({
      product: productsById.get(productId) || {
        id: productId,
        productId,
        name: `Товар #${productId}`,
        images: [],
      },
      review,
    }))
    .sort((left, right) => getReviewTime(right.review) - getReviewTime(left.review))
}

function getReviewTime(review) {
  const date = new Date(review?.updated_at ?? review?.updatedAt ?? review?.created_at ?? review?.createdAt ?? '')
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

function getOrderQuantity(order) {
  const parsed = Number.parseInt(toText(order?.quantity), 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

function getOrderUnitPrice(order) {
  return toText(order?.unitPrice ?? order?.unit_price ?? order?.totalPrice ?? order?.total_price)
}

function getOrderTotal(order) {
  return toText(order?.totalPrice ?? order?.total_price)
}

function getOrderLineTotal(order) {
  const total = getOrderTotal(order)
  if (total) {
    return total
  }

  const unitPrice = parseMoneyAmount(getOrderUnitPrice(order))
  if (unitPrice !== null) {
    return unitPrice * getOrderQuantity(order)
  }

  return getOrderUnitPrice(order)
}

function getOrderGroupTotal(group) {
  const totals = group.items.map((order) => parseMoneyAmount(getOrderLineTotal(order)))

  if (totals.every((total) => total !== null)) {
    return formatPrice(totals.reduce((sum, total) => sum + total, 0))
  }

  if (group.items.length === 1) {
    return formatPrice(getOrderLineTotal(group.items[0]))
  }

  return 'Сумма уточняется'
}

function parseMoneyAmount(value) {
  const normalized = toText(value).replace(/\s+/g, '').replace(',', '.')
  const match = normalized.match(/-?\d+(?:\.\d+)?/)
  if (!match) {
    return null
  }

  const parsed = Number.parseFloat(match[0])
  return Number.isFinite(parsed) ? parsed : null
}

function pluralizeProducts(count) {
  const value = Math.abs(count) % 100
  const last = value % 10

  if (value > 10 && value < 20) {
    return 'товаров'
  }

  if (last === 1) {
    return 'товар'
  }

  if (last >= 2 && last <= 4) {
    return 'товара'
  }

  return 'товаров'
}

function canCancelOrder(order) {
  const status = normalizeStatus(order?.status)
  return ![
    'cancelled',
    'canceled',
    'cancelled_by_client',
    'cancelled_by_seller',
    'canecelled_by_client',
    'canecelled_by_seller',
    'completed',
    'done',
    'delivered',
    'success',
  ].includes(status)
}

function canReviewOrder(order) {
  return normalizeStatus(order?.status) === 'success'
}

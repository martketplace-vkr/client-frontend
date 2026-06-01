import {
  formatPrice,
  formatUSDTPrice,
  getAddressParts,
  getProductDescription,
  getProductId,
  getProductName,
  resolveProductImage,
  shortText,
  toText,
} from '../helpers'
import { QuantityStepper } from '../components/storefront/ProductSections'

export function CartPage({
  items,
  total,
  checkoutTotals = { rub: total, usdt: 0 },
  checkoutCurrency = 'rub',
  totalCount,
  allSelected,
  isAuthorized,
  addresses = [],
  selectedDeliveryAddressId,
  checkoutBusy,
  onOpenProduct,
  onQuantityChange,
  onToggleItemSelected,
  onToggleAllSelected,
  onRemove,
  onClearCart,
  onSelectDeliveryAddress,
  onCheckoutCurrencyChange,
  onCheckout,
}) {
  const hasDeliveryAddress = addresses.length > 0

  return (
    <div className="page-content cart-layout">
      <section className="surface-card section-block">
        <div className="section-head">
          <div>
          </div>
          <div className="cart-section-actions">
            <label className="cart-select-all">
              <input
                type="checkbox"
                checked={allSelected}
                disabled={items.length === 0}
                onChange={(event) => onToggleAllSelected(event.target.checked)}
              />
              <span>Выбрать все</span>
            </label>
            <button className="button button-ghost" type="button" onClick={onClearCart} disabled={items.length === 0}>
              Очистить корзину
            </button>
          </div>
        </div>

        <div className="cart-list">
          {items.length === 0 ? (
            <div className="empty-panel large-empty">Корзина пуста. Добавьте товары из каталога.</div>
          ) : (
            items.map((item) => {
              const productId = getProductId(item.snapshot)
              const productName = getProductName(item.snapshot) || 'Без названия'

              return (
                <article key={productId} className={`cart-item${item.selected ? '' : ' cart-item--muted'}`}>
                  <label className="cart-item__select">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={(event) => onToggleItemSelected(productId, event.target.checked)}
                      aria-label={`Выбрать ${productName} для заказа`}
                    />
                  </label>
                  <button className="cart-item__media" type="button" onClick={() => onOpenProduct(item.snapshot)}>
                    {resolveProductImage(item.snapshot) ? (
                      <img src={resolveProductImage(item.snapshot)} alt={productName} />
                    ) : (
                      <div className="image-fallback">{productName.slice(0, 1) || '?'}</div>
                    )}
                  </button>

                  <div className="cart-item__copy">
                    <button className="text-link" type="button" onClick={() => onOpenProduct(item.snapshot)}>
                      {productName}
                    </button>
                    <p>{shortText(getProductDescription(item.snapshot), 140) || 'Описание отсутствует.'}</p>
                  </div>

                  <div className="cart-item__controls">
                    <QuantityStepper
                      value={item.quantity}
                      onDecrease={() => onQuantityChange(getProductId(item.snapshot), item.quantity - 1)}
                      onIncrease={() => onQuantityChange(getProductId(item.snapshot), item.quantity + 1)}
                    />
                    <strong>{formatPrice(item.lineTotal)}</strong>
                    <button
                      className="icon-button cart-remove-button"
                      type="button"
                      onClick={() => onRemove(productId)}
                      aria-label={`Удалить ${productName}`}
                      title="Удалить"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </article>
              )
            })
          )}
        </div>
      </section>

      <aside className="surface-card checkout-card">
        <h2>{checkoutCurrency === 'usdt' && checkoutTotals.usdt > 0 ? formatUSDTPrice(checkoutTotals.usdt) : formatPrice(checkoutTotals.rub)}</h2>
        <div className="checkout-card__rows">
          <div>
            <span>Выбрано товаров</span>
            <strong>{totalCount}</strong>
          </div>

        </div>

        <div className="checkout-delivery">
          <strong>Валюта оплаты</strong>
          <div className="checkout-address-list">
            <label className={`checkout-address-option ${checkoutCurrency === 'rub' ? 'active' : ''}`}>
              <input type="radio" name="checkout-currency" checked={checkoutCurrency === 'rub'} onChange={() => onCheckoutCurrencyChange('rub')} />
              <span>RUB</span>
            </label>
            <label className={`checkout-address-option ${checkoutCurrency === 'usdt' ? 'active' : ''}`}>
              <input type="radio" name="checkout-currency" checked={checkoutCurrency === 'usdt'} onChange={() => onCheckoutCurrencyChange('usdt')} />
              <span>USDT TRC-20</span>
            </label>
          </div>
          {checkoutCurrency === 'usdt' && checkoutTotals.rub > 0 ? (
            <p>Товары без криптооплаты будут оформлены отдельно в RUB: {formatPrice(checkoutTotals.rub)}</p>
          ) : null}
          {checkoutCurrency === 'usdt' && checkoutTotals.usdt > 0 ? <p>В USDT: {formatUSDTPrice(checkoutTotals.usdt)}</p> : null}
        </div>

        <div className="checkout-delivery">
          <strong>Адрес доставки</strong>
          {!isAuthorized ? (
            <p>Войдите, чтобы выбрать адрес доставки.</p>
          ) : !hasDeliveryAddress ? (
            <p>Добавьте адрес в профиле, чтобы оформить заказ.</p>
          ) : (
            <div className="checkout-address-list">
              {addresses.map((address) => {
                const addressId = getAddressId(address)
                return (
                  <label key={addressId} className={`checkout-address-option ${toText(selectedDeliveryAddressId) === addressId ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="delivery-address"
                      value={addressId}
                      checked={toText(selectedDeliveryAddressId) === addressId}
                      onChange={() => onSelectDeliveryAddress(addressId)}
                    />
                    <span>{getAddressParts(address).join(', ') || 'Адрес'}</span>
                  </label>
                )
              })}
            </div>
          )}
        </div>

        <button className="button button-primary wide-button" type="button" onClick={onCheckout} disabled={checkoutBusy || totalCount === 0 || !hasDeliveryAddress}>
          {checkoutBusy ? 'Оформляем...' : totalCount === 0 ? 'Выберите товары' : !hasDeliveryAddress ? 'Добавьте адрес' : 'Перейти к оформлению'}
        </button>
      </aside>
    </div>
  )
}

function getAddressId(address) {
  return toText(address?.id)
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d="M3 6h18" />
      <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6" />
      <path d="M19 6l-.9 13.1A2 2 0 0 1 16.1 21H7.9a2 2 0 0 1-2-1.9L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  )
}

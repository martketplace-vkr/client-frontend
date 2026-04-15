import {
  formatPrice,
  getCategoryId,
  getProductDescription,
  getProductId,
  getProductName,
  getStockCount,
  resolveProductImage,
  shortText,
} from '../helpers'
import { QuantityStepper } from '../components/storefront/ProductSections'

export function CartPage({
  items,
  total,
  totalCount,
  isAuthorized,
  addressCount,
  checkoutBusy,
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

        <button className="button button-primary wide-button" type="button" onClick={onCheckout} disabled={checkoutBusy}>
          {checkoutBusy ? 'Оформляем...' : 'Перейти к оформлению'}
        </button>
        <p className="checkout-note">
          Checkout отправит заказ в gateway и запустит backend-флоу оплаты.
        </p>
      </aside>
    </div>
  )
}

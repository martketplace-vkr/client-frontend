import {
  formatPrice,
  getCategoryId,
  getProductAttributes,
  getProductDescription,
  getProductId,
  getProductName,
  getProductPrice,
  getStockCount,
  resolveProductImage,
  toText,
} from '../helpers'
import { RelatedProductGrid } from '../components/storefront/ProductSections'

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

        <RelatedProductGrid
          products={relatedProducts}
          onOpenProduct={onOpenProduct}
          emptyMessage="Для рекомендаций пока не хватает данных каталога."
        />
      </section>
    </div>
  )
}

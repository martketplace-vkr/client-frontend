import {
  formatPrice,
  getCategoryId,
  getProductDescription,
  getProductId,
  getProductName,
  getProductPrice,
  getStockCount,
  resolveProductImage,
  shortText,
} from '../../helpers'

export function ProductGrid({ products, favoriteIds, onOpenProduct, onToggleFavorite, onAddToCart, emptyMessage }) {
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

export function ProductMiniRail({ products, onOpenProduct, emptyMessage }) {
  return (
    <div className="mini-rail">
      {products.length === 0 ? (
        <div className="empty-panel">{emptyMessage}</div>
      ) : (
        products.map((product) => (
          <button key={getProductId(product)} className="mini-product" type="button" onClick={() => onOpenProduct(product)}>
            <div className="mini-product__image">
              <ProductImage product={product} />
            </div>
            <div className="mini-product__copy">
              <strong>{getProductName(product) || 'Без названия'}</strong>
              <span>{formatPrice(getProductPrice(product))}</span>
            </div>
          </button>
        ))
      )}
    </div>
  )
}

export function RelatedProductGrid({ products, onOpenProduct, emptyMessage }) {
  return (
    <div className="related-grid">
      {products.length === 0 ? (
        <div className="empty-panel">{emptyMessage}</div>
      ) : (
        products.map((product) => (
          <button key={getProductId(product)} className="related-card" type="button" onClick={() => onOpenProduct(product)}>
            <div className="related-card__image">
              <ProductImage product={product} />
            </div>
            <strong>{getProductName(product)}</strong>
            <span>{formatPrice(getProductPrice(product))}</span>
          </button>
        ))
      )}
    </div>
  )
}

export function QuantityStepper({ value, onDecrease, onIncrease }) {
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

function ProductCard({ product, isFavorite, onOpen, onToggleFavorite, onAddToCart }) {
  return (
    <article className="surface-card product-card">
      <button className="product-card__media" type="button" onClick={() => onOpen(product)}>
        <ProductImage product={product} />
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

function ProductImage({ product, large = false }) {
  const productName = getProductName(product)
  const imageUrl = resolveProductImage(product)

  if (imageUrl) {
    return <img src={imageUrl} alt={productName} />
  }

  return <div className={`image-fallback ${large ? 'large' : ''}`}>{productName.slice(0, 1) || '?'}</div>
}

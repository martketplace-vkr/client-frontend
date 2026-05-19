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
  toText,
} from '../../helpers'

export function ProductGrid({
  products = [],
  favoriteIds = [],
  onOpenProduct,
  onToggleFavorite,
  onAddToCart,
  emptyMessage,
  variant = 'default',
  reviewSummaries = {},
}) {
  if (products.length === 0) {
    return <div className="surface-card empty-panel large-empty">{emptyMessage}</div>
  }

  const gridClassName = variant === 'feed' ? 'product-grid product-grid--feed' : 'product-grid'

  return (
    <div className={gridClassName}>
      {products.map((product) => (
        <ProductCard
          key={getProductId(product)}
          product={product}
          isFavorite={favoriteIds.includes(getProductId(product))}
          onOpen={onOpenProduct}
          onToggleFavorite={onToggleFavorite}
          onAddToCart={onAddToCart}
          variant={variant}
          reviewSummary={reviewSummaries[getProductId(product)]}
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

function ProductCard({ product, isFavorite, onOpen, onToggleFavorite, onAddToCart, variant, reviewSummary }) {
  const rating = getProductAverageRating(product, reviewSummary)
  const reviewCount = getProductReviewCount(product, reviewSummary)

  if (variant === 'feed') {
    return (
      <article className="product-card product-card--feed">
        <button className="product-card__media product-card__media--feed" type="button" onClick={() => onOpen(product)}>
          <ProductImage product={product} />
        </button>

        <button
          className={`product-card__favorite ${isFavorite ? 'active' : ''}`}
          type="button"
          onClick={() => onToggleFavorite(product)}
          aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
        >
          {isFavorite ? '♥' : '♡'}
        </button>

        <div className="product-card__body product-card__body--feed">
          <strong className="product-card__price">{formatPrice(getProductPrice(product))}</strong>
          <button className="text-link text-link-title product-card__title" type="button" onClick={() => onOpen(product)}>
            {getProductName(product) || 'Без названия'}
          </button>
          <ProductRatingMeta rating={rating} reviewCount={reviewCount} compact />
        </div>
      </article>
    )
  }

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
        <ProductRatingMeta rating={rating} reviewCount={reviewCount} />
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

function ProductRatingMeta({ rating, reviewCount, compact = false }) {
  if (!rating && !reviewCount) {
    return null
  }

  return (
    <span className={`product-card__rating ${compact ? 'product-card__rating--compact' : ''}`}>
      {rating ? (
        <span className="product-card__rating-score" aria-label={`Рейтинг ${formatRatingValue(rating)}`}>
          <span aria-hidden="true">★</span>
          <strong>{formatRatingValue(rating)}</strong>
        </span>
      ) : null}
      {reviewCount ? <span className="product-card__review-count">{reviewCount} {pluralizeReviews(reviewCount)}</span> : null}
    </span>
  )
}

function getProductAverageRating(product, summary) {
  const value = parseRating(
    summary?.average_rating ??
      summary?.averageRating ??
      product?.average_rating ??
      product?.averageRating ??
      product?.rating,
  )

  return value > 0 ? value : 0
}

function getProductReviewCount(product, summary) {
  const value = Number.parseInt(
    toText(
      summary?.rating_count ??
        summary?.ratingCount ??
        summary?.reviews_count ??
        summary?.reviewsCount ??
        product?.rating_count ??
        product?.ratingCount ??
        product?.reviews_count ??
        product?.reviewsCount ??
        product?.review_count ??
        product?.reviewCount,
    ),
    10,
  )

  return Number.isInteger(value) && value > 0 ? value : 0
}

function parseRating(value) {
  const parsed = Number.parseFloat(toText(value).replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : 0
}

function formatRatingValue(value) {
  const normalized = Math.round(value * 10) / 10
  return Number.isInteger(normalized) ? `${normalized}` : normalized.toFixed(1)
}

function pluralizeReviews(count) {
  const value = Math.abs(count) % 100
  const last = value % 10

  if (value > 10 && value < 20) {
    return 'отзывов'
  }

  if (last === 1) {
    return 'отзыв'
  }

  if (last >= 2 && last <= 4) {
    return 'отзыва'
  }

  return 'отзывов'
}

function ProductImage({ product, large = false }) {
  const productName = getProductName(product)
  const imageUrl = resolveProductImage(product)

  if (imageUrl) {
    return <img src={imageUrl} alt={productName} />
  }

  return <div className={`image-fallback ${large ? 'large' : ''}`}>{productName.slice(0, 1) || '?'}</div>
}

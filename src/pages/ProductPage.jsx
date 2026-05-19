import { useState } from 'react'
import {
  formatPrice,
  getProductAttributes,
  getProductDescription,
  getProductImages,
  getProductId,
  getProductName,
  getProductPrice,
  resolveProductImage,
  toText,
} from '../helpers'
import { RelatedProductGrid } from '../components/storefront/ProductSections'

const reportReasons = [
  { value: 'content', label: 'Неприемлемое содержание' },
  { value: 'media', label: 'Неприемлемое фото или видео' },
  { value: 'spam', label: 'Спам или реклама' },
]

export function ProductPage({
  product,
  busy,
  isFavorite,
  onBack,
  onToggleFavorite,
  onAddToCart,
  relatedProducts,
  onOpenProduct,
  reviews = [],
  reviewSummary,
  reportReviewId,
  reportForm,
  busyKeys,
  onReviewVote,
  onToggleReportForm,
  onReportFormChange,
  onReportSubmit,
}) {
  const attributeSections = getProductAttributes(product)
  const images = getProductImages(product)
  const preferredImage = resolveProductImage(product)
  const productId = getProductId(product)
  const [selectedImage, setSelectedImage] = useState({ productId: '', url: '' })
  const selectedImageUrl = selectedImage.productId === productId ? selectedImage.url : ''
  const activeImageUrl = selectedImageUrl || preferredImage || toText(images[0]?.url)

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
              {activeImageUrl ? (
                <img src={activeImageUrl} alt={getProductName(product)} />
              ) : (
                <div className="image-fallback large">{getProductName(product).slice(0, 1) || '?'}</div>
              )}
            </div>
            {images.length > 1 ? (
              <div className="product-gallery__thumbs">
                {images.map((image, index) => {
                  const imageUrl = toText(image?.url)
                  const isActive = imageUrl && imageUrl === activeImageUrl

                  return (
                    <button
                      key={`${imageUrl}-${index}`}
                      className={`product-gallery__thumb ${isActive ? 'active' : ''}`}
                      type="button"
                      onClick={() => setSelectedImage({ productId, url: imageUrl })}
                      aria-label={`Открыть изображение ${index + 1}`}
                    >
                      <img src={imageUrl} alt={`${getProductName(product)} ${index + 1}`} />
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>

          <div className="product-summary">
            <article className="surface-card product-info">
              <h1>{getProductName(product) || 'Без названия'}</h1>
              <p>{getProductDescription(product) || 'Описание пока не добавлено.'}</p>

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
              {attributeSections.length === 0 ? (
                <div className="empty-panel compact-empty">Характеристики не заполнены.</div>
              ) : (
                <div className="spec-sections">
                  {attributeSections.map((section, sectionIndex) => (
                    <section key={`${section.title}-${sectionIndex}`} className="spec-section">
                      <h3>{toText(section.title)}</h3>
                      <div className="spec-list">
                        {(section.attributes || []).map((attribute, index) => (
                          <div key={`${attribute.name}-${index}`} className="spec-row">
                            <span className="spec-row__name">{toText(attribute.key ?? attribute.name)}</span>
                            <span className="spec-row__dots" aria-hidden="true" />
                            <strong className="spec-row__value">{toText(attribute.value)}</strong>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </article>
          </div>
        </section>
      )}

      {product ? (
        <section className="section-block reviews-section">
          <div className="section-head">
            <div>
              <h2>Отзывы</h2>
              <p className="review-summary">
                <ReviewSummaryValue summary={reviewSummary} />
              </p>
            </div>
          </div>

          <div className="review-list">
            {busyKeys?.reviews ? (
              <div className="empty-panel compact-empty">Загружаем отзывы...</div>
            ) : reviews.length === 0 ? (
              <div className="empty-panel compact-empty">У товара пока нет отзывов.</div>
            ) : (
              reviews.map((review) => (
                <ReviewCard
                  key={toText(review?.id)}
                  review={review}
                  reportOpen={reportReviewId === toText(review?.id)}
                  reportForm={reportForm}
                  busyKeys={busyKeys}
                  onVote={onReviewVote}
                  onToggleReport={onToggleReportForm}
                  onReportChange={onReportFormChange}
                  onReportSubmit={onReportSubmit}
                />
              ))
            )}
          </div>
        </section>
      ) : null}

      <section className="section-block">
        <div className="section-head">
          <div>
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

function ReviewCard({
  review,
  reportOpen,
  reportForm,
  busyKeys,
  onVote,
  onToggleReport,
  onReportChange,
  onReportSubmit,
}) {
  const reviewId = toText(review?.id)
  const images = Array.isArray(review?.images) ? review.images : []
  const reply = review?.reply

  return (
    <article className="review-card">
      <div className="review-card__avatar">{toText(review?.author_name ?? review?.authorName).slice(0, 1) || 'П'}</div>
      <div className="review-card__body">
        <div className="review-card__head">
          <strong>{toText(review?.author_name ?? review?.authorName) || 'Покупатель'}</strong>
          <span>{formatReviewDate(review?.created_at ?? review?.createdAt)}</span>
          <StarRating value={Number.parseInt(review?.rating, 10) || 0} />
        </div>

        {review?.excluded_from_rating || review?.excludedFromRating ? (
          <span className="review-badge">Не учитывается в рейтинге</span>
        ) : null}

        <p>{toText(review?.comment)}</p>

        {images.length ? (
          <div className="review-images">
            {images.map((image, index) => (
              <img key={`${toText(image?.url)}-${index}`} src={toText(image?.url)} alt="" />
            ))}
          </div>
        ) : null}

        {reply ? (
          <div className="seller-reply">
            <strong>Ответ продавца</strong>
            <p>{toText(reply.comment)}</p>
          </div>
        ) : null}

        <div className="review-actions">
          <span>Вам помог этот отзыв?</span>
          <button type="button" onClick={() => onVote(reviewId, 'helpful')} disabled={busyKeys?.[`reviewVote-${reviewId}`]}>
            Да {toText(review?.helpful_count ?? review?.helpfulCount) || '0'}
          </button>
          <button type="button" onClick={() => onVote(reviewId, 'not_helpful')} disabled={busyKeys?.[`reviewVote-${reviewId}`]}>
            Нет {toText(review?.not_helpful_count ?? review?.notHelpfulCount) || '0'}
          </button>
          <button className="review-icon-button" type="button" onClick={() => onToggleReport(reviewId)} aria-label="Пожаловаться">
            !
          </button>
        </div>

        {reportOpen ? (
          <form className="review-report-form" onSubmit={(event) => onReportSubmit(event, reviewId)}>
            <h3>Укажите причину</h3>
            {reportReasons.map((reason) => (
              <label key={reason.value} className="review-radio">
                <input
                  type="radio"
                  name={`report-${reviewId}`}
                  value={reason.value}
                  checked={reportForm?.reason === reason.value}
                  onChange={() => onReportChange({ reason: reason.value })}
                />
                <span>{reason.label}</span>
              </label>
            ))}
            <textarea
              className="field-control"
              value={reportForm?.details || ''}
              onChange={(event) => onReportChange({ details: event.target.value })}
              placeholder="Опишите причину подробнее"
              rows={3}
            />
            <div className="inline-actions">
              <button className="button button-secondary button-small" type="submit" disabled={busyKeys?.[`reviewReport-${reviewId}`]}>
                Отправить жалобу
              </button>
              <button className="button button-small button-ghost" type="button" onClick={() => onToggleReport(reviewId)}>
                Закрыть
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </article>
  )
}

function StarRating({ value }) {
  return (
    <div className="star-rating" aria-label={`${value} из 5`}>
      {[1, 2, 3, 4, 5].map((rating) => (
        <span key={rating} className={rating <= value ? 'active' : ''}>★</span>
      ))}
    </div>
  )
}

function ReviewSummaryValue({ summary }) {
  const count = Number.parseInt(summary?.rating_count ?? summary?.ratingCount, 10) || 0
  const average = Number.parseFloat(summary?.average_rating ?? summary?.averageRating) || 0
  if (count === 0) {
    return 'Оценок пока нет'
  }

  return (
    <>
      <span className="review-summary__score">
        <span aria-hidden="true">★</span>
        <strong>{formatRatingValue(average)}</strong>
      </span>
      <span>{count} {pluralizeReviews(count)}</span>
    </>
  )
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

function formatReviewDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

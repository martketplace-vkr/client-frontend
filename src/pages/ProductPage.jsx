import { useEffect, useState } from 'react'
import {
  formatPrice,
  getCategoryId,
  getProductAttributes,
  getProductDescription,
  getProductImages,
  getProductId,
  getProductName,
  getProductPrice,
  getStockCount,
  resolveProductImage,
  toText,
} from '../helpers'
import { RelatedProductGrid } from '../components/storefront/ProductSections'

export function ProductPage({ product, busy, isFavorite, onBack, onToggleFavorite, onAddToCart, relatedProducts, onOpenProduct }) {
  const attributeSections = getProductAttributes(product)
  const images = getProductImages(product)
  const preferredImage = resolveProductImage(product)
  const [selectedImageUrl, setSelectedImageUrl] = useState(preferredImage)

  useEffect(() => {
    setSelectedImageUrl(preferredImage)
  }, [preferredImage, product])

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
                      onClick={() => setSelectedImageUrl(imageUrl)}
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

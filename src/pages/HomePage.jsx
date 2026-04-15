import { promoCards, serviceCards } from '../marketplaceContent'
import { ProductGrid, ProductMiniRail } from '../components/storefront/ProductSections'

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

        <ProductMiniRail
          products={latestProducts}
          onOpenProduct={onOpenProduct}
          emptyMessage="Пока нет товаров для нижней витрины."
        />
      </section>
    </div>
  )
}

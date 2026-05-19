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
    </div>
  )
}

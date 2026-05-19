import { getProductId } from '../helpers'
import { ProductGrid, ProductMiniRail } from '../components/storefront/ProductSections'

export function FavoritesPage({ items, recentItems, onOpenProduct, onToggleFavorite, onAddToCart, reviewSummaries }) {
  return (
    <div className="page-content">
      <section className="surface-card section-block">
        <div className="section-head">
        </div>

        <ProductGrid
          products={items}
          favoriteIds={items.map((item) => getProductId(item))}
          onOpenProduct={onOpenProduct}
          onToggleFavorite={onToggleFavorite}
          onAddToCart={onAddToCart}
          reviewSummaries={reviewSummaries}
          emptyMessage="Пока пусто. Добавьте товары из каталога или карточки товара."
        />
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <h2>Недавно открывали</h2>
          </div>
        </div>

        <ProductMiniRail
          products={recentItems}
          onOpenProduct={onOpenProduct}
          emptyMessage="История просмотров появится после открытия карточек товаров."
        />
      </section>
    </div>
  )
}

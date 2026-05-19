import { ProductGrid } from '../components/storefront/ProductSections'

export function HomePage({
  homeProducts,
  favoriteIds,
  busyProducts,
  hasMoreProducts,
  loadingMoreProducts,
  onOpenProduct,
  onToggleFavorite,
  onLoadMoreProducts,
  reviewSummaries,
}) {
  return (
    <div className="page-content home-feed">
      <ProductGrid
        products={homeProducts}
        favoriteIds={favoriteIds}
        onOpenProduct={onOpenProduct}
        onToggleFavorite={onToggleFavorite}
        reviewSummaries={reviewSummaries}
        emptyMessage={busyProducts ? 'Загружаем товары...' : 'Каталог пуст. Проверьте API или добавьте товары.'}
        variant="feed"
      />

      {hasMoreProducts ? (
        <div className="pagination-footer">
          <button className="button button-secondary load-more-button" type="button" onClick={onLoadMoreProducts} disabled={loadingMoreProducts}>
            {loadingMoreProducts ? 'Загружаем...' : 'Показать ещё'}
          </button>
        </div>
      ) : null}
    </div>
  )
}

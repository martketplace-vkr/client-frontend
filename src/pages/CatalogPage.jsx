import { ProductGrid } from '../components/storefront/ProductSections'

export function CatalogPage({
  categories,
  selectedCategoryId,
  onCategoryChange,
  search,
  onSearchChange,
  visibleProducts,
  favoriteIds,
  busyProducts,
  onReload,
  onOpenProduct,
  onToggleFavorite,
  onAddToCart,
  onResetFilters,
}) {
  return (
    <div className="page-content catalog-page">
      <section className="surface-card section-block">
        <div className="section-head">
          <div>
            <span className="eyebrow">каталог</span>
            <h1>Подберите нужный товар без лишних действий</h1>
          </div>

          <div className="section-actions">
            <button className="button button-secondary" type="button" onClick={onReload} disabled={busyProducts}>
              {busyProducts ? 'Обновляем...' : 'Обновить'}
            </button>
            <button className="button button-ghost" type="button" onClick={onResetFilters}>
              Сбросить
            </button>
          </div>
        </div>

        <div className="catalog-toolbar">
          <label className="filter-block">
            <span>Категория</span>
            <select value={selectedCategoryId} onChange={(event) => onCategoryChange(event.target.value)}>
              <option value="">Все категории</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-block">
            <span>Поиск</span>
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Например, кофеварка, наушники, стол"
            />
          </label>
        </div>
      </section>

      <ProductGrid
        products={visibleProducts}
        favoriteIds={favoriteIds}
        onOpenProduct={onOpenProduct}
        onToggleFavorite={onToggleFavorite}
        onAddToCart={onAddToCart}
        emptyMessage="Ничего не нашли. Попробуйте сменить категорию или очистить поиск."
      />
    </div>
  )
}

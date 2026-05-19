import { useMemo, useState } from 'react'
import { ProductGrid } from '../components/storefront/ProductSections'

export function CatalogPage({
  categoryTree = [],
  categoryOptions = [],
  selectedCategoryId,
  onCategoryChange,
  search = '',
  visibleProducts = [],
  favoriteIds = [],
  busyProducts,
  hasMoreProducts,
  loadingMoreProducts,
  onReload,
  onLoadMoreProducts,
  onOpenProduct,
  onToggleFavorite,
  reviewSummaries,
  onResetFilters,
}) {
  const rootCategories = Array.isArray(categoryTree) ? categoryTree : []
  const [activeRootId, setActiveRootId] = useState('')
  const activeRoot = rootCategories.find((category) => getCategoryId(category) === activeRootId) || rootCategories[0] || null
  const activeRootIdValue = getCategoryId(activeRoot)
  const selectedCategoryName = useMemo(
    () => categoryOptions.find((category) => category.value === selectedCategoryId)?.label.trim() || '',
    [categoryOptions, selectedCategoryId],
  )
  const hasSearch = search.trim().length > 0
  const showProducts = Boolean(selectedCategoryId || hasSearch)

  if (showProducts) {
    return (
      <div className="page-content catalog-page">
        <section className="catalog-results-toolbar">
          <button className="catalog-results-back" type="button" onClick={onResetFilters}>
            ← Каталог
          </button>

          <div className="catalog-results-summary">
            <strong>{selectedCategoryName || (hasSearch ? `Поиск: ${search}` : 'Товары каталога')}</strong>
            <span>{visibleProducts.length} товаров</span>
          </div>

          <button
            className="catalog-results-refresh"
            type="button"
            onClick={onReload}
            disabled={busyProducts}
            title="Обновить"
            aria-label="Обновить товары"
          >
            ↻
          </button>
        </section>

        <ProductGrid
          products={visibleProducts}
          favoriteIds={favoriteIds}
          onOpenProduct={onOpenProduct}
          onToggleFavorite={onToggleFavorite}
          reviewSummaries={reviewSummaries}
          emptyMessage={busyProducts ? 'Загружаем товары...' : 'Ничего не нашли. Вернитесь в каталог и выберите другой раздел.'}
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

  return (
    <div className="catalog-browser">
      <aside className="catalog-sidebar" aria-label="Разделы каталога">
        <button className="catalog-sidebar__all" type="button" onClick={() => onCategoryChange('')}>
          <span className="catalog-sidebar__mark">M</span>
          <strong>Весь каталог</strong>
        </button>

        <div className="catalog-root-list">
          {rootCategories.map((category) => {
            const categoryId = getCategoryId(category)
            const active = categoryId === activeRootIdValue

            return (
              <button
                key={categoryId}
                className={`catalog-root-item ${active ? 'active' : ''}`}
                type="button"
                onClick={() => setActiveRootId(categoryId)}
              >
                <span className="catalog-root-item__icon">{getCategoryName(category).slice(0, 1)}</span>
                <span>{getCategoryName(category) || 'Без названия'}</span>
              </button>
            )
          })}
        </div>
      </aside>

      <section className="catalog-category-panel">
        {activeRoot ? (
          <>
            <div className="catalog-category-head">
              <h1>{getCategoryName(activeRoot)}</h1>
              <button className="button button-ghost" type="button" onClick={() => onCategoryChange(activeRootIdValue)}>
                Все товары раздела
              </button>
            </div>

            <div className="catalog-category-grid">
              {getCategoryChildren(activeRoot).length === 0 ? (
                <div className="empty-panel catalog-empty">В этом разделе пока нет подкатегорий.</div>
              ) : (
                getCategoryChildren(activeRoot).map((group) => (
                  <CategoryGroup key={getCategoryId(group)} category={group} onCategoryChange={onCategoryChange} />
                ))
              )}
            </div>
          </>
        ) : (
          <div className="empty-panel catalog-empty">Категории появятся, когда API вернет дерево каталога.</div>
        )}
      </section>
    </div>
  )
}

function CategoryGroup({ category, onCategoryChange }) {
  const children = getCategoryChildren(category)

  return (
    <article className="catalog-category-group">
      <button className="catalog-category-group__title" type="button" onClick={() => onCategoryChange(getCategoryId(category))}>
        {getCategoryName(category) || 'Без названия'}
      </button>

      {children.length > 0 ? (
        <div className="catalog-category-links">
          {children.map((child) => (
            <button key={getCategoryId(child)} type="button" onClick={() => onCategoryChange(getCategoryId(child))}>
              {getCategoryName(child) || 'Без названия'}
            </button>
          ))}
        </div>
      ) : null}
    </article>
  )
}

function getCategoryId(category) {
  return `${category?.id ?? category?.categoryId ?? ''}`
}

function getCategoryName(category) {
  return `${category?.name ?? ''}`.trim()
}

function getCategoryChildren(category) {
  return Array.isArray(category?.children) ? category.children : []
}

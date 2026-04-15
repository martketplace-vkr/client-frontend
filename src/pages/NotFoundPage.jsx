export function NotFoundPage({ onGoHome }) {
  return (
    <div className="page-content">
      <section className="surface-card empty-panel large-empty">
        <h1>Страница не найдена</h1>
        <p>Такого раздела нет в текущем storefront.</p>
        <button className="button button-primary" type="button" onClick={onGoHome}>
          На главную
        </button>
      </section>
    </div>
  )
}

export function SiteNavigation({ items, activePage, onSelectItem, mobile = false }) {
  const navClassName = mobile ? 'mobile-nav' : 'main-nav'
  const linkClassName = mobile ? 'mobile-nav__link' : 'nav-link'
  const ariaLabel = mobile ? 'Мобильная навигация' : 'Основная навигация'

  return (
    <nav className={navClassName} aria-label={ariaLabel}>
      {items.map((item) => (
        <button
          key={mobile ? `mobile-${item.path}` : item.path}
          className={`${linkClassName} ${activePage === item.page ? 'active' : ''}`}
          type="button"
          onClick={() => onSelectItem(item)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}

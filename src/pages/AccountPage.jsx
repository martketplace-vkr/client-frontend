import { compactStatus, formatDateTime, formatMoney, getAddressParts, toText } from '../helpers'
import { Field } from '../ui'

export function AccountPage({
  isAuthorized,
  sessionStatus,
  profileForm,
  addressForm,
  addresses,
  orders,
  busyKeys,
  cartCount,
  favoriteCount,
  onProfileChange,
  onAddressChange,
  onProfileSubmit,
  onAddressSubmit,
  onCancelOrder,
  onReloadDashboard,
  onLogout,
  onReloadAddresses,
  hasPrivateData,
}) {
  const fullName = [profileForm.firstName, profileForm.lastName].filter(Boolean).join(' ')

  return (
    <div className="page-content account-layout">
      <section className="surface-card account-overview">
        <span className="eyebrow">аккаунт</span>
        <h1>{isAuthorized ? fullName || 'Ваш профиль' : 'Войдите, чтобы оформлять заказы'}</h1>
        <p>
          Здесь собраны личные данные, адреса доставки и история заказов. Баланс, пополнение и вывод вынесены на отдельную страницу кошелька.
        </p>

        <div className="overview-stats">
          <div className="stat-card">
            <span>Статус</span>
            <strong>{sessionStatus}</strong>
          </div>
          <div className="stat-card">
            <span>Заказы</span>
            <strong>{orders.length}</strong>
          </div>
          <div className="stat-card">
            <span>Корзина</span>
            <strong>{cartCount}</strong>
          </div>
          <div className="stat-card">
            <span>Избранное</span>
            <strong>{favoriteCount}</strong>
          </div>
        </div>

        <div className="inline-actions">
          <button className="button button-secondary" type="button" onClick={onReloadDashboard} disabled={!hasPrivateData || busyKeys.dashboard}>
            {busyKeys.dashboard ? 'Обновляем...' : 'Обновить заказы'}
          </button>
          <button className="button button-ghost" type="button" onClick={onLogout} disabled={!isAuthorized || busyKeys.logout}>
            Выйти
          </button>
        </div>
      </section>

      <div className="account-columns">
        <section className={`surface-card account-panel ${isAuthorized ? '' : 'panel-locked'}`}>
          <div className="section-head">
            <div>
              <span className="eyebrow">профиль</span>
              <h2>Личные данные</h2>
            </div>
          </div>

          <form className="form-stack" onSubmit={onProfileSubmit}>
            <div className="form-row">
              <Field
                label="Имя"
                value={profileForm.firstName}
                onChange={(event) => onProfileChange((current) => ({ ...current, firstName: event.target.value }))}
                placeholder="Анна"
                disabled={!isAuthorized}
                autoComplete="given-name"
              />
              <Field
                label="Фамилия"
                value={profileForm.lastName}
                onChange={(event) => onProfileChange((current) => ({ ...current, lastName: event.target.value }))}
                placeholder="Иванова"
                disabled={!isAuthorized}
                autoComplete="family-name"
              />
            </div>
            <Field
              label="Email"
              type="email"
              value={profileForm.email}
              onChange={(event) => onProfileChange((current) => ({ ...current, email: event.target.value }))}
              placeholder="you@example.com"
              disabled={!isAuthorized}
              autoComplete="email"
            />
            <Field
              label="Ссылка на аватар"
              value={profileForm.avatarUrl}
              onChange={(event) => onProfileChange((current) => ({ ...current, avatarUrl: event.target.value }))}
              placeholder="https://..."
              disabled={!isAuthorized}
            />

            <button className="button button-primary" type="submit" disabled={!isAuthorized || busyKeys.profile}>
              {busyKeys.profile ? 'Сохраняем...' : 'Сохранить профиль'}
            </button>
          </form>
        </section>

        <section className={`surface-card account-panel ${isAuthorized ? '' : 'panel-locked'}`}>
          <div className="section-head">
            <div>
              <span className="eyebrow">адреса</span>
              <h2>Доставка</h2>
            </div>
            <button
              className="button button-secondary"
              type="button"
              onClick={onReloadAddresses}
              disabled={!isAuthorized || busyKeys.addresses}
            >
              Обновить
            </button>
          </div>

          <form className="form-stack" onSubmit={onAddressSubmit}>
            <div className="form-row">
              <Field
                label="Страна"
                value={addressForm.country}
                onChange={(event) => onAddressChange((current) => ({ ...current, country: event.target.value }))}
                placeholder="Россия"
                disabled={!isAuthorized}
                autoComplete="country-name"
              />
              <Field
                label="Город"
                value={addressForm.city}
                onChange={(event) => onAddressChange((current) => ({ ...current, city: event.target.value }))}
                placeholder="Москва"
                disabled={!isAuthorized}
                autoComplete="address-level2"
              />
            </div>
            <Field
              label="Улица"
              value={addressForm.street}
              onChange={(event) => onAddressChange((current) => ({ ...current, street: event.target.value }))}
              placeholder="ул. Ленина, 10"
              disabled={!isAuthorized}
              autoComplete="street-address"
            />
            <Field
              label="Индекс"
              value={addressForm.postalCode}
              onChange={(event) => onAddressChange((current) => ({ ...current, postalCode: event.target.value }))}
              placeholder="101000"
              disabled={!isAuthorized}
              autoComplete="postal-code"
            />

            <button className="button button-primary" type="submit" disabled={!isAuthorized || busyKeys.address}>
              {busyKeys.address ? 'Добавляем...' : 'Добавить адрес'}
            </button>
          </form>

          <div className="address-grid">
            {addresses.length === 0 ? (
              <div className="empty-panel compact-empty">Адресов пока нет.</div>
            ) : (
              addresses.map((address, index) => (
                <article key={`${toText(address.id)}-${index}`} className="address-tile">
                  <strong>{getAddressParts(address).slice(0, 2).join(', ') || 'Адрес'}</strong>
                  <span>{getAddressParts(address).join(', ')}</span>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      <section className={`surface-card account-panel ${isAuthorized ? '' : 'panel-locked'}`}>
        <div className="section-head">
          <div>
            <span className="eyebrow">заказы</span>
            <h2>История заказов</h2>
          </div>
        </div>

        <div className="account-list">
          {orders.length === 0 ? (
            <div className="empty-panel compact-empty">Заказов пока нет.</div>
          ) : (
            orders.map((order) => (
              <article key={toText(order.id)} className="account-row order-row">
                <div>
                  <strong>Заказ #{toText(order.id)}</strong>
                  <span>{order.product?.productName || order.product?.product_name || 'Товар'}</span>
                  <span>{formatDateTime(order.createdAt ?? order.created_at)}</span>
                </div>
                <div>
                  <strong>{formatMoney(order.totalPrice ?? order.total_price)}</strong>
                  <span>{compactStatus(order.status)}</span>
                </div>
                <button
                  className="button button-ghost button-small"
                  type="button"
                  onClick={() => onCancelOrder(order.id)}
                  disabled={!isAuthorized || busyKeys[`order-${order.id}`] || !canCancelOrder(order)}
                >
                  Отменить
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

function canCancelOrder(order) {
  const status = toText(order?.status).toLowerCase()
  return !['cancelled', 'canceled', 'completed', 'done', 'delivered'].includes(status)
}

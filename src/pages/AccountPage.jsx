import { useState } from 'react'
import { ProductGrid } from '../components/storefront/ProductSections'
import { compactStatus, copyText, formatDateTime, formatMoney, getAddressParts, getProductId, toText } from '../helpers'
import { Field, FileUploadField } from '../ui'

const ACCOUNT_NAV_ITEMS = [
  { id: 'personal', label: 'Личные данные', icon: 'user' },
  { id: 'delivery', label: 'Доставка', icon: 'bag' },
  { id: 'orders', label: 'Заказы', icon: 'box' },
  { id: 'wallet', label: 'Кошелек', icon: 'card' },
  { id: 'favorites', label: 'Избранное', icon: 'heart' },
  { id: 'reviews', label: 'Отзывы', icon: 'star' },
]

export function AccountPage({
  isAuthorized,
  sessionStatus,
  profileForm,
  addressForm,
  addresses,
  orders,
  wallet,
  depositAddresses,
  transactions,
  topUps,
  favoriteItems,
  busyKeys,
  onProfileChange,
  onAvatarUpload,
  onAddressChange,
  onProfileSubmit,
  onAddressSubmit,
  onCancelOrder,
  onReloadDashboard,
  onLogout,
  onReloadAddresses,
  onOpenProduct,
  onToggleFavorite,
  onAddToCart,
  hasPrivateData,
}) {
  const [activeNavItem, setActiveNavItem] = useState('personal')

  function handleAccountNav(item) {
    setActiveNavItem(item.id)
  }

  return (
    <div className="page-content account-layout">
      <div className="account-shell">
        <aside className="account-sidebar" aria-label="Навигация профиля">
          <nav className="account-menu">
            {ACCOUNT_NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`account-menu__item ${activeNavItem === item.id ? 'active' : ''}`}
                type="button"
                onClick={() => handleAccountNav(item)}
              >
                <AccountNavIcon name={item.icon} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="account-main">
          {activeNavItem === 'personal' ? (
            <PersonalSection
              isAuthorized={isAuthorized}
              sessionStatus={sessionStatus}
              profileForm={profileForm}
              busyKeys={busyKeys}
              onProfileChange={onProfileChange}
              onAvatarUpload={onAvatarUpload}
              onProfileSubmit={onProfileSubmit}
              onReloadDashboard={onReloadDashboard}
              onLogout={onLogout}
              hasPrivateData={hasPrivateData}
            />
          ) : null}

          {activeNavItem === 'delivery' ? (
            <DeliverySection
              isAuthorized={isAuthorized}
              addressForm={addressForm}
              addresses={addresses}
              busyKeys={busyKeys}
              onAddressChange={onAddressChange}
              onAddressSubmit={onAddressSubmit}
              onReloadAddresses={onReloadAddresses}
            />
          ) : null}

          {activeNavItem === 'orders' ? (
            <OrdersSection
              isAuthorized={isAuthorized}
              orders={orders}
              busyKeys={busyKeys}
              onCancelOrder={onCancelOrder}
            />
          ) : null}

          {activeNavItem === 'reviews' ? <ReviewsSection isAuthorized={isAuthorized} /> : null}

          {activeNavItem === 'wallet' ? (
            <AccountWalletSection
              isAuthorized={isAuthorized}
              wallet={wallet}
              depositAddresses={depositAddresses}
              transactions={transactions}
              topUps={topUps}
              busyKeys={busyKeys}
              onReloadDashboard={onReloadDashboard}
              hasPrivateData={hasPrivateData}
            />
          ) : null}

          {activeNavItem === 'favorites' ? (
            <AccountFavoritesSection
              favoriteItems={favoriteItems}
              onOpenProduct={onOpenProduct}
              onToggleFavorite={onToggleFavorite}
              onAddToCart={onAddToCart}
            />
          ) : null}
        </main>
      </div>
    </div>
  )
}

function PersonalSection({
  isAuthorized,
  profileForm,
  busyKeys,
  onProfileChange,
  onAvatarUpload,
  onProfileSubmit,
  onReloadDashboard,
  onLogout,
  hasPrivateData,
}) {
  return (
    <section className={`surface-card account-panel ${isAuthorized ? '' : 'panel-locked'}`}>
      <div className="section-head">
        <div>
          <span className="eyebrow">аккаунт</span>
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
          placeholder="you@example.com"
          disabled={!isAuthorized}
          readOnly
          autoComplete="email"
        />
        <FileUploadField
          label="Загрузить аватар"
          accept="image/*"
          onChange={onAvatarUpload}
          disabled={!isAuthorized || busyKeys.mediaAvatar}
          busy={busyKeys.mediaAvatar}
          hint="После загрузки ссылка появится в поле аватара."
        />

        <div className="inline-actions">
          <button className="button button-primary" type="submit" disabled={!isAuthorized || busyKeys.profile}>
            {busyKeys.profile ? 'Сохраняем...' : 'Сохранить профиль'}
          </button>
          <button className="button button-secondary" type="button" onClick={onReloadDashboard} disabled={!hasPrivateData || busyKeys.dashboard}>
            {busyKeys.dashboard ? 'Обновляем...' : 'Обновить'}
          </button>
          <button className="button button-ghost" type="button" onClick={onLogout} disabled={!isAuthorized || busyKeys.logout}>
            Выйти
          </button>
        </div>
      </form>
    </section>
  )
}

function DeliverySection({
  isAuthorized,
  addressForm,
  addresses,
  busyKeys,
  onAddressChange,
  onAddressSubmit,
  onReloadAddresses,
}) {
  return (
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
  )
}

function OrdersSection({ isAuthorized, orders, busyKeys, onCancelOrder }) {
  return (
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
  )
}

function ReviewsSection({ isAuthorized }) {
  return (
    <section className={`surface-card account-panel ${isAuthorized ? '' : 'panel-locked'}`}>
      <div className="section-head">
        <div>
          <span className="eyebrow">отзывы</span>
          <h2>Отзывы</h2>
        </div>
      </div>
      <div className="empty-panel compact-empty">Отзывов пока нет.</div>
    </section>
  )
}

function AccountWalletSection({
  isAuthorized,
  wallet,
  depositAddresses = [],
  transactions = [],
  topUps = [],
  busyKeys,
  onReloadDashboard,
  hasPrivateData,
}) {
  const wallets = buildAccountWallets(wallet, depositAddresses, topUps)
  const [selectedCurrency, setSelectedCurrency] = useState('')
  const selectedWallet = wallets.find((item) => item.currency === selectedCurrency)

  if (selectedWallet) {
    const isUsdt = selectedWallet.currency === 'usdt'

    return (
      <div className="account-wallet-detail-stack">
        <section className={`surface-card wallet-detail-card ${isAuthorized ? '' : 'panel-locked'}`}>
          <div className="wallet-detail__top">
            <button className="back-link" type="button" onClick={() => setSelectedCurrency('')}>
              Назад к кошелькам
            </button>
            <div className="wallet-detail__identity">
              <span className={`wallet-icon wallet-icon-${selectedWallet.tone} wallet-icon-compact`}>
                {selectedWallet.icon}
                {isUsdt ? <i>T</i> : null}
              </span>
              <strong>{isUsdt ? 'USDT TRC-20' : 'RUB'}</strong>
              {isUsdt ? <span className="wallet-network-pill">TRC-20</span> : null}
              {isUsdt && selectedWallet.address ? (
                <button className="wallet-address-pill copy-pill" type="button" onClick={() => void copyText(selectedWallet.address)}>
                  {shortAddress(selectedWallet.address)}
                </button>
              ) : null}
            </div>
            <button className="button button-secondary button-small" type="button" onClick={onReloadDashboard} disabled={!hasPrivateData || busyKeys.dashboard}>
              Обновить
            </button>
          </div>

          <div className="wallet-detail__balance">
            <strong>
              {selectedWallet.amount} <span>{selectedWallet.title}</span>
            </strong>
          </div>

          <div className="wallet-actions">
            <button className="wallet-action" type="button" disabled={!isAuthorized || isUsdt}>
              Пополнить
            </button>
            <button className="wallet-action" type="button" disabled={!isAuthorized || isUsdt}>
              Вывести
            </button>
            {isUsdt ? (
              <button className="wallet-action" type="button" disabled>
                Обменять
              </button>
            ) : null}
          </div>
        </section>

        {isUsdt ? (
          <section className="surface-card wallet-info-card">
            <span className="eyebrow">адрес пополнения</span>
            <h2>USDT TRC-20</h2>
            <div className="wallet-address-box">
              <code>{selectedWallet.address || 'Адрес еще не создан.'}</code>
              <button className="button button-secondary button-small" type="button" onClick={() => void copyText(selectedWallet.address)} disabled={!selectedWallet.address}>
                Скопировать
              </button>
            </div>
          </section>
        ) : null}

        {isUsdt ? (
          <section className="surface-card wallet-info-card">
            <span className="eyebrow">ledger</span>
            <h2>Последние операции</h2>
            <div className="account-list">
              {transactions.length === 0 ? (
                <div className="empty-panel compact-empty">Транзакций пока нет.</div>
              ) : (
                transactions.map((transaction) => (
                  <article key={toText(transaction.id)} className="account-row transaction-row">
                    <div>
                      <strong>{compactStatus(transaction.type)}</strong>
                      <span>{transaction.reason || transaction.referenceId || transaction.reference_id || 'Операция по кошельку'}</span>
                    </div>
                    <div>
                      <strong>{compactStatus(transaction.status)}</strong>
                      <span>{formatDateTime(transaction.postedAt ?? transaction.posted_at ?? transaction.createdAt ?? transaction.created_at)}</span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        ) : null}
      </div>
    )
  }

  return (
    <section className={`surface-card account-panel ${isAuthorized ? '' : 'panel-locked'}`}>
      <div className="section-head">
        <div>
          <span className="eyebrow">кошелек</span>
        </div>
      </div>

      <div className="wallet-card-list account-wallet-list">
        {wallets.map((item) => (
          <button
            key={item.currency}
            className="wallet-card surface-card account-wallet-card"
            type="button"
            onClick={() => setSelectedCurrency(item.currency)}
            disabled={!isAuthorized}
          >
            <span className={`wallet-icon wallet-icon-${item.tone}`}>
              {item.icon}
              {item.currency === 'usdt' ? <i>T</i> : null}
            </span>
            <span className="wallet-card__content">
              <span className="wallet-card__amount">
                {item.amount} <b>{item.title}</b>
              </span>
              <span className="wallet-card__subtitle">{item.subtitle}</span>
            </span>
            {item.address ? <span className="wallet-address-pill">{shortAddress(item.address)}</span> : null}
          </button>
        ))}
      </div>
    </section>
  )
}

function AccountFavoritesSection({ favoriteItems, onOpenProduct, onToggleFavorite, onAddToCart }) {
  return (
    <section className="surface-card account-panel">
      <div className="section-head">
        <div>
          <span className="eyebrow">избранное</span>
          <h2>Избранные товары</h2>
        </div>
      </div>

      <ProductGrid
        products={favoriteItems}
        favoriteIds={favoriteItems.map((item) => getProductId(item))}
        onOpenProduct={onOpenProduct}
        onToggleFavorite={onToggleFavorite}
        onAddToCart={onAddToCart}
        emptyMessage="Пока пусто. Добавьте товары из каталога или карточки товара."
      />
    </section>
  )
}

function buildAccountWallets(wallet, depositAddresses, topUps) {
  return [
    {
      currency: 'rub',
      title: 'RUB',
      subtitle: 'Рублевый кошелек',
      icon: 'R',
      amount: getAccountBalance(wallet, 1000, '0.00'),
      tone: 'rub',
    },
    {
      currency: 'usdt',
      title: 'USDT',
      subtitle: 'USDT TRC-20',
      icon: 'U',
      amount: getAccountBalance(wallet, 2001, '0.00'),
      tone: 'usdt',
      address: resolveDepositAddress(depositAddresses, topUps),
    },
  ]
}

function getAccountBalance(wallet, currencyCode, fallback) {
  const targetCurrencyCode = toText(currencyCode)
  const account = wallet?.accounts?.find(
    (item) =>
      toText(item?.currencyCode ?? item?.currency_code) === targetCurrencyCode &&
      toText(item?.accountType ?? item?.account_type).includes('AVAILABLE'),
  )
  const parsed = Number.parseFloat(toText(account?.balance ?? fallback).replace(',', '.'))

  return Number.isFinite(parsed) ? parsed.toFixed(2) : fallback
}

function resolveDepositAddress(depositAddresses, topUps) {
  const depositAddress = depositAddresses.find((address) => address.address)
  const latestAddress = topUps.find((topUp) => topUp.walletAddress || topUp.wallet_address)

  return depositAddress?.address || latestAddress?.walletAddress || latestAddress?.wallet_address || ''
}

function shortAddress(address) {
  const value = toText(address)
  if (value.length <= 10) {
    return value
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`
}

function AccountNavIcon({ name }) {
  const icons = {
    user: (
      <>
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
      </>
    ),
    bag: (
      <>
        <path d="M6 8h12l-1 12H7L6 8Z" />
        <path d="M9 8a3 3 0 0 1 6 0" />
      </>
    ),
    box: (
      <>
        <path d="m4 7 8-4 8 4-8 4-8-4Z" />
        <path d="M4 7v10l8 4 8-4V7" />
        <path d="M12 11v10" />
      </>
    ),
    card: (
      <>
        <path d="M4 7h16v10H4V7Z" />
        <path d="M4 10h16" />
        <path d="M7 15h4" />
      </>
    ),
    heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />,
    star: <path d="m12 4 2.4 5 5.5.8-4 3.9.9 5.5-4.8-2.6-4.8 2.6.9-5.5-4-3.9 5.5-.8L12 4Z" />,
  }

  return (
    <svg className="account-menu__icon" viewBox="0 0 24 24" aria-hidden="true">
      {icons[name]}
    </svg>
  )
}

function canCancelOrder(order) {
  const status = toText(order?.status).toLowerCase()
  return !['cancelled', 'canceled', 'completed', 'done', 'delivered'].includes(status)
}

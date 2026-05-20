import { useState } from 'react'
import { compactStatus, copyText, formatDateTime, formatMoney, toText } from '../helpers'

const RUB_WALLET = {
  currency: 'rub',
  title: 'RUB',
  subtitle: 'Рублевый кошелек',
  icon: 'R',
  amount: '0.00',
  fiat: '',
  tone: 'rub',
}

export function WalletPage({
  isAuthorized,
  selectedCurrency,
  wallet,
  depositAddresses,
  transactions,
  topUps,
  rubTopUpForm,
  busyKeys,
  onReloadDashboard,
  onOpenWallet,
  onBackToWallets,
  onRubTopUpChange,
  onCreateRubTopUp,
  hasPrivateData,
}) {
  const rubWallet = buildRubWallet(wallet)
  const usdtWallet = buildUsdtWallet(wallet, topUps, depositAddresses)
  const wallets = [rubWallet, usdtWallet]
  const selectedWallet = wallets.find((item) => item.currency === selectedCurrency)

  if (selectedWallet) {
    return (
      <WalletDetails
        wallet={selectedWallet}
        transactions={selectedWallet.currency === 'usdt' ? transactions : []}
        onBack={onBackToWallets}
        onReloadDashboard={onReloadDashboard}
        rubTopUpForm={rubTopUpForm}
        onRubTopUpChange={onRubTopUpChange}
        onCreateRubTopUp={onCreateRubTopUp}
        hasPrivateData={hasPrivateData}
        busyKeys={busyKeys}
        isAuthorized={isAuthorized}
      />
    )
  }

  return (
    <div className="page-content wallet-layout">
      <section className="surface-card wallet-hero">
        <div>
          <h1>Мои кошельки</h1>
          <p>Рублевый баланс для покупок и криптовый USDT TRC-20 кошелек для депозитов.</p>
        </div>
        <button className="button button-secondary" type="button" onClick={onReloadDashboard} disabled={!hasPrivateData || busyKeys.dashboard}>
          {busyKeys.dashboard ? 'Обновляем...' : 'Обновить'}
        </button>
      </section>

      <section className="wallet-card-list">
        {wallets.map((item) => (
          <button
            key={item.currency}
            className="wallet-card surface-card"
            type="button"
            onClick={() => onOpenWallet(item.currency)}
            disabled={!isAuthorized}
          >
            <WalletIcon wallet={item} />
            <span className="wallet-card__content">
              <span className="wallet-card__amount">
                {item.amount} <b>{item.title}</b>
              </span>
              <span className="wallet-card__subtitle">{item.subtitle}</span>
            </span>
            {item.fiat ? <span className="wallet-fiat">{item.fiat}</span> : null}
            {item.address ? <span className="wallet-address-pill">{shortAddress(item.address)}</span> : null}
          </button>
        ))}
      </section>
    </div>
  )
}

function WalletDetails({ wallet, transactions, onBack, onReloadDashboard, rubTopUpForm, onRubTopUpChange, onCreateRubTopUp, hasPrivateData, busyKeys, isAuthorized }) {
  const isUsdt = wallet.currency === 'usdt'
  const [topUpOpen, setTopUpOpen] = useState(false)

  return (
    <div className="page-content wallet-layout">
      <section className="surface-card wallet-detail-card">
        <div className="wallet-detail__top">
          <button className="back-link" type="button" onClick={onBack}>
            Назад к кошелькам
          </button>
          <div className="wallet-detail__identity">
            <WalletIcon wallet={wallet} compact />
            <strong>{isUsdt ? 'USDT TRC-20' : 'RUB'}</strong>
            {isUsdt ? <span className="wallet-network-pill">TRC-20</span> : null}
            {isUsdt && wallet.address ? (
              <button className="wallet-address-pill copy-pill" type="button" onClick={() => void copyText(wallet.address)}>
                {shortAddress(wallet.address)}
              </button>
            ) : null}
          </div>
          <button className="button button-secondary button-small" type="button" onClick={onReloadDashboard} disabled={!hasPrivateData || busyKeys.dashboard}>
            Обновить
          </button>
        </div>

        <div className="wallet-detail__balance">
          <strong>
            {wallet.amount} <span>{wallet.title}</span>
          </strong>
          {wallet.fiat ? <em>{wallet.fiat}</em> : null}
        </div>

        <div className="wallet-actions">
          <button className="wallet-action" type="button" disabled={!isAuthorized || isUsdt} onClick={() => setTopUpOpen(true)}>
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
          <h2>USDT TRC-20</h2>
          <p>Отправляй только USDT в сети TRON/TRC-20. Перевод другой валюты или сети может быть потерян.</p>
          <div className="wallet-address-box">
            <code>{wallet.address || 'Адрес еще не создан. Создай crypto top-up через API.'}</code>
            <button className="button button-secondary button-small" type="button" onClick={() => void copyText(wallet.address)} disabled={!wallet.address}>
              Скопировать
            </button>
          </div>
        </section>
      ) : null}

      {isUsdt ? (
        <section className="surface-card wallet-info-card">
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

      {topUpOpen && !isUsdt ? (
        <div
          className="modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setTopUpOpen(false)
            }
          }}
        >
          <section className="surface-card modal-card rub-topup-modal" role="dialog" aria-modal="true" aria-labelledby="rub-topup-title">
            <button className="modal-close" type="button" onClick={() => setTopUpOpen(false)} aria-label="Закрыть">
              ×
            </button>
            <form className="rub-topup-form" onSubmit={onCreateRubTopUp}>
              <div className="modal-copy">
                <h2 id="rub-topup-title">Пополнение RUB</h2>
                <p>Выберите сумму и способ оплаты. После создания платежа откроется страница провайдера.</p>
              </div>
              <label className="field">
                <span>Сумма</span>
                <input
                  className="field-control"
                  value={rubTopUpForm?.amount || ''}
                  onChange={(event) => onRubTopUpChange?.((current) => ({ ...current, amount: event.target.value }))}
                  inputMode="decimal"
                  placeholder="1000"
                  required
                />
              </label>
              <div className="rub-topup-methods" role="radiogroup" aria-label="Способ оплаты">
                {[
                  ['sbp', 'СБП'],
                  ['card', 'Карта'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    className={`rub-topup-method ${rubTopUpForm?.method === value ? 'active' : ''}`}
                    type="button"
                    onClick={() => onRubTopUpChange?.((current) => ({ ...current, method: value }))}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button className="button button-primary wide-button" type="submit" disabled={busyKeys.rubTopUp}>
                {busyKeys.rubTopUp ? 'Создаем платеж...' : 'Перейти к оплате'}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  )
}

function WalletIcon({ wallet, compact = false }) {
  return (
    <span className={`wallet-icon wallet-icon-${wallet.tone} ${compact ? 'wallet-icon-compact' : ''}`}>
      {wallet.icon}
      {wallet.currency === 'usdt' ? <i>T</i> : null}
    </span>
  )
}

function buildRubWallet(wallet) {
  const availableAccount = findAvailableAccount(wallet, 1000)
  const amount = formatBalanceAmount(formatMoney(
    {
      amount: availableAccount?.balance ?? RUB_WALLET.amount,
      currency_code: availableAccount?.currencyCode ?? availableAccount?.currency_code ?? 1000,
    },
    `${RUB_WALLET.amount} RUB`,
  ).replace(/\s*(RUB|1000)$/, ''))

  return {
    ...RUB_WALLET,
    amount,
  }
}

function buildUsdtWallet(wallet, topUps = [], depositAddresses = []) {
  const availableAccount = findAvailableAccount(wallet, 2001)
  const depositAddress = depositAddresses.find((address) => address.address)
  const latestAddress = topUps.find((topUp) => topUp.walletAddress || topUp.wallet_address)
  const amount = formatBalanceAmount(formatMoney(
    {
      amount: availableAccount?.balance ?? '0.000',
      currency_code: availableAccount?.currencyCode ?? availableAccount?.currency_code ?? 2001,
    },
    '0.000 USDT',
  ).replace(/\s*USDT$/, ''))

  return {
    currency: 'usdt',
    title: 'USDT',
    subtitle: 'USDT TRC-20',
    icon: 'U',
    amount,
    fiat: '0.00 RUB',
    tone: 'usdt',
    address: depositAddress?.address || latestAddress?.walletAddress || latestAddress?.wallet_address || '',
  }
}

function accountType(account) {
  return toText(account?.accountType ?? account?.account_type)
}

function accountCurrencyCode(account) {
  return toText(account?.currencyCode ?? account?.currency_code)
}

function findAvailableAccount(wallet, currencyCode) {
  const targetCurrencyCode = toText(currencyCode)

  return wallet?.accounts?.find(
    (account) => accountCurrencyCode(account) === targetCurrencyCode && accountType(account).includes('AVAILABLE'),
  )
}

function formatBalanceAmount(value) {
  const normalized = toText(value).trim().replace(',', '.')
  const parsed = Number.parseFloat(normalized)

  if (!Number.isFinite(parsed)) {
    return toText(value)
  }

  return parsed.toFixed(2)
}

function shortAddress(address) {
  const value = toText(address)
  if (value.length <= 10) {
    return value || 'Нет адреса'
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`
}

import { Field } from '../../ui'

export function AuthDialog({
  open,
  authMode,
  authForm,
  busyKeys,
  onClose,
  onAuthModeChange,
  onAuthFormChange,
  onAuthSubmit,
}) {
  if (!open) {
    return null
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <section
        className="surface-card modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" aria-label="Закрыть окно входа" onClick={onClose}>
          ×
        </button>

        <div className="modal-copy">
          <span className="eyebrow">вход в аккаунт</span>
          <h2 id="auth-dialog-title">{authMode === 'login' ? 'Авторизация' : 'Регистрация'}</h2>
          <p>Профиль доступен только авторизованным пользователям. Войдите, чтобы открыть личный кабинет.</p>
          <p className="auth-switch">
            {authMode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
            <button
              className="auth-switch__link"
              type="button"
              onClick={() => onAuthModeChange(authMode === 'login' ? 'register' : 'login')}
            >
              {authMode === 'login' ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </div>

        <form className="form-stack" onSubmit={onAuthSubmit}>
          <Field
            label="Email"
            type="email"
            value={authForm.email}
            onChange={(event) => onAuthFormChange((current) => ({ ...current, email: event.target.value }))}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Field
            label="Пароль"
            type="password"
            value={authForm.password}
            onChange={(event) => onAuthFormChange((current) => ({ ...current, password: event.target.value }))}
            placeholder="Введите пароль"
            autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
          />

          <button className="button button-primary wide-button" type="submit" disabled={busyKeys.auth}>
            {busyKeys.auth ? 'Подождите...' : authMode === 'login' ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>
      </section>
    </div>
  )
}

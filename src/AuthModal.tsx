import { useCallback, useEffect, useRef, useState } from 'react'
import {
  authLogin,
  authOAuthFacebook,
  authOAuthGoogle,
  authRegister,
  errorMessageFromUnknown,
  fetchAuthProviders,
  getCachedAuthProviders,
  invalidateAuthProvidersCache,
  persistSession,
  type AuthProviders,
} from './authApi'

type Tab = 'signin' | 'signup'

type Props = {
  open: boolean
  onClose: () => void
  onSuccess: () => void | Promise<void>
  initialTab?: Tab
}

/** Allow several cold-start `/auth/me` attempts (see `fetchMe` retries + ~26s fetch timeout each). */
const PROFILE_SYNC_TIMEOUT_MS = 90_000
const PROFILE_SYNC_TIMEOUT_MARKER = '__translate_chat_profile_sync_timeout__'

/**
 * After a token is saved, `onSuccess` runs `fetchMe` + billing sync — that can hang on a cold API.
 * Never block closing the modal or clearing `busy` indefinitely.
 */
async function finishSessionAndClose(
  onSuccess: () => void | Promise<void>,
  onClose: () => void,
  onSyncTimeout: () => void,
): Promise<void> {
  try {
    await Promise.race([
      Promise.resolve(onSuccess()),
      new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error(PROFILE_SYNC_TIMEOUT_MARKER)), PROFILE_SYNC_TIMEOUT_MS),
      ),
    ])
    onClose()
  } catch (e) {
    if (e instanceof Error && e.message === PROFILE_SYNC_TIMEOUT_MARKER) {
      onSyncTimeout()
      // Keep the modal open so the hint is visible; token is already saved.
      return
    }
    throw e
  }
}

function loadScript(src: string, timeoutMs = 20_000): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      resolve()
      return
    }
    const timer = window.setTimeout(() => {
      reject(new Error('Sign-in script took too long to load. Check your network or try again.'))
    }, timeoutMs)
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => {
      clearTimeout(timer)
      resolve()
    }
    s.onerror = () => {
      clearTimeout(timer)
      reject(new Error(`Failed to load script`))
    }
    document.head.appendChild(s)
  })
}

function IconGoogle() {
  return (
    <svg className="auth-modal__oauth-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function IconFacebook() {
  return (
    <svg className="auth-modal__oauth-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
    </svg>
  )
}

export function AuthModal({ open, onClose, onSuccess, initialTab = 'signin' }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [providers, setProviders] = useState<AuthProviders | null>(() => getCachedAuthProviders())
  const [providersErr, setProvidersErr] = useState<string | null>(null)

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')

  const [signinEmail, setSigninEmail] = useState('')
  const [signinPassword, setSigninPassword] = useState('')

  const [busy, setBusy] = useState(false)
  const [formErr, setFormErr] = useState<string | null>(null)
  const [oauthErr, setOauthErr] = useState<string | null>(null)
  const [sessionHint, setSessionHint] = useState<string | null>(null)
  const [fbReady, setFbReady] = useState(false)
  const [fbSdkErr, setFbSdkErr] = useState<string | null>(null)
  const fbInitAppIdRef = useRef<string | null>(null)

  const loadProviders = useCallback(() => {
    const hit = getCachedAuthProviders()
    if (hit) {
      setProviders(hit)
      setProvidersErr(null)
      return Promise.resolve()
    }
    setProvidersErr(null)
    return fetchAuthProviders()
      .then((p) => {
        setProviders(p)
        setProvidersErr(null)
      })
      .catch((e) => {
        setProviders(null)
        setProvidersErr(e instanceof Error ? e.message : String(e))
      })
  }, [])

  useEffect(() => {
    if (open) {
      setTab(initialTab)
      setFormErr(null)
      setOauthErr(null)
      setSessionHint(null)
      setFbSdkErr(null)
      const cached = getCachedAuthProviders()
      if (cached) {
        setProviders(cached)
        setProvidersErr(null)
      }
    }
  }, [open, initialTab])

  useEffect(() => {
    if (!open) return
    void loadProviders()
  }, [open, loadProviders])

  useEffect(() => {
    if (!open || !providers?.facebook_app_id) {
      setFbReady(false)
      return
    }
    const appId = providers.facebook_app_id.trim()
    if (!appId) {
      setFbReady(false)
      return
    }

    setFbReady(false)
    setFbSdkErr(null)

    const markReady = () => {
      fbInitAppIdRef.current = appId
      setFbReady(true)
    }

    const initFb = (): boolean => {
      if (!window.FB) return false
      try {
        window.FB.init({
          appId,
          cookie: true,
          xfbml: false,
          version: 'v18.0',
        })
      } catch {
        /* already initialised for this load */
      }
      markReady()
      return true
    }

    if (fbInitAppIdRef.current === appId && window.FB) {
      setFbReady(true)
      return
    }

    window.fbAsyncInit = () => {
      if (window.FB) {
        window.FB.init({
          appId,
          cookie: true,
          xfbml: false,
          version: 'v18.0',
        })
        markReady()
      }
    }

    if (initFb()) return

    void loadScript('https://connect.facebook.net/en_US/sdk.js')
      .then(() => {
        const deadline = Date.now() + 12000
        const poll = () => {
          if (initFb()) return
          if (Date.now() < deadline) {
            window.requestAnimationFrame(poll)
          } else {
            setFbSdkErr('Facebook sign-in did not finish loading. Check your network or try disabling ad blockers.')
          }
        }
        poll()
      })
      .catch(() => setFbSdkErr('Could not load Facebook’s sign-in script.'))
  }, [open, providers?.facebook_app_id])

  const finishWithToken = useCallback(
    async (getToken: () => Promise<string>) => {
      setOauthErr(null)
      setSessionHint(null)
      setBusy(true)
      try {
        const tok = await getToken()
        persistSession(tok)
        await finishSessionAndClose(
          onSuccess,
          onClose,
          () =>
            setSessionHint(
              'Signed in, but loading your profile is slow. Refresh the page if your name does not appear.',
            ),
        )
      } catch (e) {
        setOauthErr(errorMessageFromUnknown(e))
      } finally {
        setBusy(false)
      }
    },
    [onClose, onSuccess],
  )

  const onGoogleClick = async () => {
    if (!providers?.google_client_id) return
    setOauthErr(null)
    try {
      if (!window.google?.accounts?.oauth2) {
        await loadScript('https://accounts.google.com/gsi/client')
      }
      const oauth2 = window.google?.accounts?.oauth2
      if (!oauth2) {
        setOauthErr('Could not load Google sign-in')
        return
      }
      const clientId = providers.google_client_id
      const client = oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: (tokenResponse) => {
          if (tokenResponse.error) {
            setOauthErr(tokenResponse.error_description || tokenResponse.error)
            return
          }
          const at = tokenResponse.access_token
          if (!at) {
            setOauthErr('Google sign-in did not return a token')
            return
          }
          void finishWithToken(() => authOAuthGoogle({ access_token: at }))
        },
      })
      client.requestAccessToken()
    } catch (e) {
      setOauthErr(errorMessageFromUnknown(e) || 'Could not load Google sign-in')
    }
  }

  const onFacebookClick = () => {
    if (!providers?.facebook_app_id) return
    if (!fbReady || !window.FB) {
      setOauthErr(fbSdkErr ?? 'Facebook is still loading — try again in a moment')
      return
    }
    window.FB.login(
      (response: {
        authResponse?: { accessToken: string }
        status?: string
        errorMessage?: string
      }) => {
        const msg = response.errorMessage?.trim()
        if (msg) {
          setOauthErr(msg)
          return
        }
        const tok = response.authResponse?.accessToken
        if (!tok) {
          setOauthErr('Facebook sign-in was cancelled or did not return a token')
          return
        }
        void finishWithToken(() => authOAuthFacebook(tok))
      },
      // Do not pass `public_profile` here: we only need an access token so the API can call Graph `me?id`.
      // Note: Meta’s JS SDK may still default to `public_profile` for the login dialog — that is platform-side.
      {},
    )
  }

  const onSubmitSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErr(null)
    if (password !== password2) {
      setFormErr('Passwords do not match')
      return
    }
    setBusy(true)
    try {
      await authRegister(username.trim(), email.trim(), password)
      const tok = await authLogin(email.trim(), password)
      persistSession(tok)
      await finishSessionAndClose(
        onSuccess,
        onClose,
        () =>
          setSessionHint(
            'Account created, but syncing is slow. Refresh the page if something looks out of date.',
          ),
      )
    } catch (err) {
      setFormErr(errorMessageFromUnknown(err))
    } finally {
      setBusy(false)
    }
  }

  const onSubmitSignin = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErr(null)
    setBusy(true)
    try {
      const tok = await authLogin(signinEmail.trim(), signinPassword)
      persistSession(tok)
      await finishSessionAndClose(
        onSuccess,
        onClose,
        () =>
          setSessionHint(
            'Signed in, but loading your profile is slow. Refresh the page if your name does not appear.',
          ),
      )
    } catch (err) {
      setFormErr(errorMessageFromUnknown(err))
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null

  const hasGoogle = Boolean(providers?.google_client_id?.trim())
  const hasFacebook = Boolean(providers?.facebook_app_id?.trim())
  const providersLoading = providers === null && !providersErr
  const oauthRowDisabled = busy || providersLoading
  const googleUsable = hasGoogle && !providersLoading
  const facebookUsable = hasFacebook && !providersLoading && fbReady

  const retryProviders = () => {
    invalidateAuthProvidersCache()
    void loadProviders()
  }

  return (
    <div className="auth-modal" role="dialog" aria-modal="true" aria-label="Sign in">
      <button type="button" className="auth-modal__backdrop" aria-label="Close" onClick={onClose} />
      <div className={`auth-modal__panel${tab === 'signup' ? ' auth-modal__panel--signup' : ''}`}>
        <div className="auth-modal__head">
          <div>
            <p className="auth-modal__eyebrow">Translate Chat</p>
            <h2 className="auth-modal__title">{tab === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
            <p className="auth-modal__subtitle">
              {tab === 'signup'
                ? 'Fill in every field below — then tap the green button. You’ll be signed in automatically.'
                : 'Sign in to sync jobs and unlock future features.'}
            </p>
          </div>
          <button type="button" className="auth-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="auth-modal__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'signin'}
            className={`auth-modal__tab${tab === 'signin' ? ' auth-modal__tab--active' : ''}`}
            onClick={() => {
              setTab('signin')
              setFormErr(null)
            }}
          >
            <span className="auth-modal__tab-label">Sign in</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'signup'}
            className={`auth-modal__tab${tab === 'signup' ? ' auth-modal__tab--active' : ''}`}
            onClick={() => {
              setTab('signup')
              setFormErr(null)
            }}
          >
            <span className="auth-modal__tab-label">Sign up</span>
            <span className="auth-modal__tab-badge" aria-hidden>
              New
            </span>
          </button>
        </div>

        {providersErr ? (
          <p className="auth-modal__warn" role="status">
            Could not load provider config: {providersErr}{' '}
            <button type="button" className="auth-modal__retry-btn" onClick={retryProviders}>
              Retry
            </button>
          </p>
        ) : null}

        {sessionHint ? (
          <p className="auth-modal__hint" role="status">
            {sessionHint}{' '}
            <button type="button" className="auth-modal__retry-btn" onClick={onClose}>
              Close
            </button>
          </p>
        ) : null}

        {tab === 'signup' ? (
          <form className="auth-modal__form auth-modal__form--signup" onSubmit={onSubmitSignup}>
            <div className="auth-modal__signup-guide" role="note">
              <span className="auth-modal__signup-guide__tag">Sign up</span>
              <p className="auth-modal__signup-guide__text">
                <strong>All four fields are required.</strong> Username: letters, numbers, _ or - only (3–32
                characters). Password: at least 8 characters — type it twice to confirm.
              </p>
            </div>

            <p className="auth-modal__group-head">Profile</p>
            <label className="auth-modal__label">
              <span className="auth-modal__label-row">
                Username <span className="auth-modal__req">Required</span>
              </span>
              <input
                className="auth-modal__input"
                name="username"
                autoComplete="username"
                placeholder="your_name"
                value={username}
                onChange={(ev) => setUsername(ev.target.value)}
                required
                minLength={3}
                maxLength={32}
                pattern="[a-zA-Z0-9_-]{3,32}"
                title="3–32 characters: letters, numbers, underscore, hyphen"
              />
            </label>
            <label className="auth-modal__label">
              <span className="auth-modal__label-row">
                Email <span className="auth-modal__req">Required</span>
              </span>
              <input
                className="auth-modal__input"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                required
              />
            </label>

            <p className="auth-modal__group-head">Password</p>
            <label className="auth-modal__label">
              <span className="auth-modal__label-row">
                Password <span className="auth-modal__req">Required · 8+ chars</span>
              </span>
              <input
                className="auth-modal__input"
                type="password"
                name="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                required
                minLength={8}
              />
            </label>
            <label className="auth-modal__label">
              <span className="auth-modal__label-row">
                Confirm password <span className="auth-modal__req">Required</span>
              </span>
              <input
                className="auth-modal__input"
                type="password"
                name="password2"
                autoComplete="new-password"
                placeholder="Repeat password"
                value={password2}
                onChange={(ev) => setPassword2(ev.target.value)}
                required
                minLength={8}
              />
            </label>
            {formErr ? (
              <p className="auth-modal__error" role="alert">
                {formErr}
              </p>
            ) : null}
            <button type="submit" className="auth-modal__submit auth-modal__submit--signup btn primary" disabled={busy}>
              {busy ? 'Creating your account…' : 'Create account & sign me in'}
            </button>
          </form>
        ) : (
          <form className="auth-modal__form" onSubmit={onSubmitSignin}>
            <label className="auth-modal__label">
              Email
              <input
                className="auth-modal__input"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={signinEmail}
                onChange={(ev) => setSigninEmail(ev.target.value)}
                required
              />
            </label>
            <label className="auth-modal__label">
              Password
              <input
                className="auth-modal__input"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={signinPassword}
                onChange={(ev) => setSigninPassword(ev.target.value)}
                required
              />
            </label>
            {formErr ? (
              <p className="auth-modal__error" role="alert">
                {formErr}
              </p>
            ) : null}
            <button type="submit" className="auth-modal__submit btn primary" disabled={busy}>
              {busy ? 'Please wait…' : 'Sign in'}
            </button>
          </form>
        )}

        <div className="auth-modal__divider" aria-hidden="true">
          <span className="auth-modal__divider-line" />
          <span className="auth-modal__divider-text">or continue with</span>
          <span className="auth-modal__divider-line" />
        </div>

        <div id="fb-root" />
        {providersLoading ? (
          <div className="auth-modal__oauth-loading" role="status" aria-live="polite">
            <span className="auth-modal__oauth-loading-pulse" aria-hidden />
            <span>Loading Google &amp; Facebook sign-in…</span>
          </div>
        ) : (
          <div className="auth-modal__oauth-row">
            <div className="auth-modal__oauth-cell">
              <button
                type="button"
                className="auth-modal__oauth-btn auth-modal__oauth-btn--social"
                disabled={oauthRowDisabled || !googleUsable}
                title={
                  !hasGoogle
                    ? 'Set GOOGLE_OAUTH_CLIENT_ID on the API to enable'
                    : tab === 'signup'
                      ? 'Sign up with Google'
                      : 'Sign in with Google'
                }
                onClick={() => {
                  if (!googleUsable) return
                  void onGoogleClick()
                }}
              >
                <IconGoogle />
                <span>Continue with Google</span>
              </button>
            </div>
            <div className="auth-modal__oauth-cell">
              <button
                type="button"
                className="auth-modal__oauth-btn auth-modal__oauth-btn--social"
                disabled={oauthRowDisabled || !facebookUsable}
                title={
                  !hasFacebook
                    ? 'Set FACEBOOK_APP_ID on the API to enable'
                    : !fbReady
                      ? 'Facebook is still loading'
                      : 'Continue with Facebook'
                }
                onClick={() => {
                  if (!hasFacebook || !facebookUsable) return
                  setOauthErr(null)
                  onFacebookClick()
                }}
              >
                <IconFacebook />
                <span>{hasFacebook && !fbReady ? 'Facebook (loading…)' : 'Continue with Facebook'}</span>
              </button>
            </div>
          </div>
        )}
        {fbSdkErr && hasFacebook && !providersLoading ? (
          <p className="auth-modal__hint auth-modal__hint--fb" role="status">
            {fbSdkErr}
          </p>
        ) : null}

        {oauthErr ? (
          <p className="auth-modal__error auth-modal__error--oauth" role="alert">
            {oauthErr}
          </p>
        ) : null}

      </div>
    </div>
  )
}

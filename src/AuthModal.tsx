import { useCallback, useEffect, useRef, useState } from 'react'
import {
  authLogin,
  authOAuthApple,
  authOAuthFacebook,
  authOAuthGoogle,
  authRegister,
  fetchAuthProviders,
  persistSession,
  type AuthProviders,
} from './authApi'

type Tab = 'signin' | 'signup'

type Props = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  initialTab?: Tab
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      resolve()
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Failed to load script`))
    document.head.appendChild(s)
  })
}

export function AuthModal({ open, onClose, onSuccess, initialTab = 'signin' }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [providers, setProviders] = useState<AuthProviders | null>(null)
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

  const googleBtnRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setTab(initialTab)
      setFormErr(null)
      setOauthErr(null)
    }
  }, [open, initialTab])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    fetchAuthProviders()
      .then((p) => {
        if (!cancelled) {
          setProviders(p)
          setProvidersErr(null)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setProviders(null)
          setProvidersErr(e instanceof Error ? e.message : String(e))
        }
      })
    return () => {
      cancelled = true
    }
  }, [open])

  const finishWithToken = useCallback(
    async (getToken: () => Promise<string>) => {
      setOauthErr(null)
      setBusy(true)
      try {
        const tok = await getToken()
        persistSession(tok)
        onSuccess()
        onClose()
      } catch (e) {
        setOauthErr(e instanceof Error ? e.message : String(e))
      } finally {
        setBusy(false)
      }
    },
    [onClose, onSuccess],
  )

  // Google Sign-In button
  useEffect(() => {
    if (!open || !providers?.google_client_id || !googleBtnRef.current) return
    const el = googleBtnRef.current
    const clientId = providers.google_client_id
    let cancelled = false

    ;(async () => {
      try {
        await loadScript('https://accounts.google.com/gsi/client')
        if (cancelled || !el.isConnected) return
        el.innerHTML = ''
        const g = window.google
        if (!g?.accounts?.id) return
        g.accounts.id.initialize({
          client_id: clientId,
          callback: (resp: { credential?: string }) => {
            if (!resp.credential) return
            void finishWithToken(() => authOAuthGoogle(resp.credential!))
          },
        })
        g.accounts.id.renderButton(el, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          width: 280,
        })
      } catch {
        if (!cancelled) setOauthErr('Could not load Google sign-in')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, providers?.google_client_id, finishWithToken])

  // Facebook SDK
  useEffect(() => {
    if (!open || !providers?.facebook_app_id) return
    const appId = providers.facebook_app_id
    window.fbAsyncInit = function () {
      if (window.FB) {
        window.FB.init({
          appId,
          cookie: true,
          xfbml: false,
          version: 'v18.0',
        })
      }
    }
    void loadScript('https://connect.facebook.net/en_US/sdk.js').catch(() => {})
  }, [open, providers?.facebook_app_id])

  const onFacebookClick = () => {
    if (!window.FB) {
      setOauthErr('Facebook SDK not ready yet — try again in a moment')
      return
    }
    window.FB.login(
      (response: { authResponse?: { accessToken: string } }) => {
        const tok = response.authResponse?.accessToken
        if (!tok) {
          setOauthErr('Facebook sign-in was cancelled or did not return a token')
          return
        }
        void finishWithToken(() => authOAuthFacebook(tok))
      },
      { scope: 'public_profile,email' },
    )
  }

  const onAppleClick = async () => {
    if (!providers?.apple_client_id) return
    setOauthErr(null)
    setBusy(true)
    try {
      await loadScript('https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js')
      const AppleID = window.AppleID
      if (!AppleID?.auth) {
        setOauthErr('Apple Sign In script did not load')
        return
      }
      AppleID.auth.init({
        clientId: providers.apple_client_id,
        scope: 'name email',
        redirectURI: window.location.origin,
        usePopup: true,
      })
      const res = await AppleID.auth.signIn()
      const idToken = res.authorization?.id_token
      if (!idToken) {
        setOauthErr(res.error || 'Apple did not return an id_token')
        return
      }
      await finishWithToken(() => authOAuthApple(idToken))
    } catch (e) {
      setOauthErr(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
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
      onSuccess()
      onClose()
    } catch (err) {
      setFormErr(err instanceof Error ? err.message : String(err))
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
      onSuccess()
      onClose()
    } catch (err) {
      setFormErr(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null

  const hasGoogle = Boolean(providers?.google_client_id)
  const hasFacebook = Boolean(providers?.facebook_app_id)
  const hasApple = Boolean(providers?.apple_client_id)
  const hasAnyOAuth = hasGoogle || hasFacebook || hasApple

  return (
    <div className="auth-modal" role="dialog" aria-modal="true" aria-label="Sign in">
      <button type="button" className="auth-modal__backdrop" aria-label="Close" onClick={onClose} />
      <div className="auth-modal__panel">
        <div className="auth-modal__head">
          <h2 className="auth-modal__title">{tab === 'signup' ? 'Create account' : 'Sign in'}</h2>
          <button type="button" className="auth-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="auth-modal__tabs">
          <button
            type="button"
            className={`auth-modal__tab${tab === 'signin' ? ' auth-modal__tab--active' : ''}`}
            onClick={() => {
              setTab('signin')
              setFormErr(null)
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`auth-modal__tab${tab === 'signup' ? ' auth-modal__tab--active' : ''}`}
            onClick={() => {
              setTab('signup')
              setFormErr(null)
            }}
          >
            Sign up
          </button>
        </div>

        {providersErr ? (
          <p className="auth-modal__warn" role="status">
            Could not load sign-in options: {providersErr}
          </p>
        ) : null}

        {tab === 'signup' ? (
          <form className="auth-modal__form" onSubmit={onSubmitSignup}>
            <label className="auth-modal__label">
              Username
              <input
                className="auth-modal__input"
                name="username"
                autoComplete="username"
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
              Email
              <input
                className="auth-modal__input"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                required
              />
            </label>
            <label className="auth-modal__label">
              Password
              <input
                className="auth-modal__input"
                type="password"
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                required
                minLength={8}
              />
            </label>
            <label className="auth-modal__label">
              Confirm password
              <input
                className="auth-modal__input"
                type="password"
                name="password2"
                autoComplete="new-password"
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
            <button type="submit" className="btn primary auth-modal__submit" disabled={busy}>
              {busy ? 'Please wait…' : 'Create account'}
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
            <button type="submit" className="btn primary auth-modal__submit" disabled={busy}>
              {busy ? 'Please wait…' : 'Sign in'}
            </button>
          </form>
        )}

        {hasAnyOAuth ? (
          <>
            <p className="auth-modal__divider">
              <span>or continue with</span>
            </p>
            <div id="fb-root" />
            <div className="auth-modal__oauth">
              {hasGoogle ? <div ref={googleBtnRef} className="auth-modal__google-host" /> : null}
              {hasFacebook ? (
                <button
                  type="button"
                  className="btn auth-modal__oauth-fb"
                  disabled={busy}
                  onClick={() => {
                    setOauthErr(null)
                    onFacebookClick()
                  }}
                >
                  Facebook
                </button>
              ) : null}
              {hasApple ? (
                <button type="button" className="btn auth-modal__oauth-apple" disabled={busy} onClick={onAppleClick}>
                  Apple
                </button>
              ) : null}
            </div>
            {oauthErr ? (
              <p className="auth-modal__error" role="alert">
                {oauthErr}
              </p>
            ) : null}
            <p className="auth-modal__hint">
              Social sign-in must be enabled on the API (Google / Facebook / Apple env vars). Configure return URLs
              in each developer console to match this site&apos;s origin.
            </p>
          </>
        ) : !providersErr ? (
          <p className="auth-modal__hint">No social providers configured on the server — use email and password.</p>
        ) : null}
      </div>
    </div>
  )
}

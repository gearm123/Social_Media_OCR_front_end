export {}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: Record<string, unknown>) => void
          renderButton: (el: HTMLElement, cfg: Record<string, unknown>) => void
        }
        oauth2: {
          initTokenClient: (cfg: {
            client_id: string
            scope: string
            callback: (resp: {
              access_token?: string
              error?: string
              error_description?: string
            }) => void
          }) => {
            requestAccessToken: (opts?: { prompt?: string }) => void
          }
        }
      }
    }
    FB?: {
      init: (cfg: Record<string, unknown>) => void
      login: (
        cb: (r: {
          authResponse?: { accessToken: string }
          status?: string
          errorMessage?: string
        }) => void,
        opts?: { scope: string },
      ) => void
    }
    fbAsyncInit?: () => void
  }
}

export {}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: Record<string, unknown>) => void
          renderButton: (el: HTMLElement, cfg: Record<string, unknown>) => void
        }
      }
    }
    FB?: {
      init: (cfg: Record<string, unknown>) => void
      login: (
        cb: (r: { authResponse?: { accessToken: string }; status?: string }) => void,
        opts?: { scope: string },
      ) => void
    }
    fbAsyncInit?: () => void
  }
}

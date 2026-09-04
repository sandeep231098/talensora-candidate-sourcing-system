import Keycloak from 'keycloak-js'

export const keycloak = new Keycloak({
  url:
    import.meta.env.VITE_KEYCLOAK_URL ??
    'http://localhost:8180',
  realm: import.meta.env.VITE_KEYCLOAK_REALM ?? 'talensora',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? 'talensora-web',
})

let initializationPromise: Promise<boolean> | null = null

export const initializeKeycloak = (): Promise<boolean> => {
  if (!initializationPromise) {
    initializationPromise = keycloak.init({
      onLoad: 'check-sso',
      flow: 'standard',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    })
  }

  return initializationPromise
}

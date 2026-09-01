import Keycloak from 'keycloak-js'

export const keycloak = new Keycloak({
  url: 'http://localhost:8180',
  realm: 'talensora',
  clientId: 'talensora-web',
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
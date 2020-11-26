export const environment = {
  name: 'local',
  production: false,
  // API_URL: 'http://localhost:3000/api/',
  API_URL: 'https://dls-api-cosmatt-dev.herokuapp.com/api/',
  orgid: 'cosmatt',
  gaKey: 'UA-103388543-1',
  userbackAccessToken: '1769|2413|JmIxVpfenQaNpQQRmKJpzsIIxVQWHqurNcZJCeY058NuZEmlo5',
  identityService: {
    appID: "COSMATT",
    appENV: "DEV",
    urls: {
      //redirectSignIn: "localhost:4200",
      redirectSignIn: "https://cosmatt-dev.comprodls.com/app/",
      //redirectSignOut: "localhost:4200",
      redirectSignOut: "https://cosmatt-dev.comprodls.com/app/"
    }
  },
  products : [
    "eefc192b-b081-11ea-b32f-0e34ffe5d91e",
    "bf97985c-b1ed-11ea-b32f-0e34ffe5d91e"
  ]
};


// UserProfile returned by the backend
export interface UserProfile {
  // name of the user
  name: string;
  // uuid of the user assigned by DLS
  uuid: string;
  // email of the user
  email: string;
  //Store Roles Of User
  roles: object;
}

// Tokens passed as query params in URL
export interface TokenAuthParams {
  // Value of access_token in the query params
  accessToken: string;
  // Value of org_id in the query params
  orgId: string;
}

// Authentication end points to be used
export enum AuthEndPoints {
  VALIDATE_TOKEN = 'auth/validate-token',
  LOGIN = 'auth/login',
  SIGNOUT = 'auth/signout',
  AUTO_REGISTRATION = 'auth/auto-registration',
  
}

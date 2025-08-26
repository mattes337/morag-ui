export interface AuthConfig {
  enableHeaderAuth: boolean;
  ssoHeaderName: string;
  ssoEmailHeader: string;
  ssoNameHeader: string;
  ssoRoleHeader: string;
  enableAutoLogin: boolean;
  autoLoginEmail: string;
  autoLoginPassword: string;
  autoLoginName: string;
}

export const authConfig: AuthConfig = {
  enableHeaderAuth: process.env.ENABLE_HEADER_AUTH === 'true',
  ssoHeaderName: process.env.SSO_HEADER_NAME || 'X-Remote-User',
  ssoEmailHeader: process.env.SSO_EMAIL_HEADER || 'X-Remote-Email',
  ssoNameHeader: process.env.SSO_NAME_HEADER || 'X-Remote-Name',
  ssoRoleHeader: process.env.SSO_ROLE_HEADER || 'X-Remote-Role',
  enableAutoLogin: process.env.NODE_ENV === 'development' && process.env.ENABLE_AUTO_LOGIN === 'true',
  autoLoginEmail: process.env.AUTO_LOGIN_EMAIL || 'admin@morag.local',
  autoLoginPassword: process.env.AUTO_LOGIN_PASSWORD || 'admin123',
  autoLoginName: process.env.AUTO_LOGIN_NAME || 'Development Admin',
};
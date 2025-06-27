export interface AuthConfig {
  enableHeaderAuth: boolean;
  ssoHeaderName: string;
  ssoEmailHeader: string;
  ssoNameHeader: string;
  ssoRoleHeader: string;
}

export const authConfig: AuthConfig = {
  enableHeaderAuth: process.env.ENABLE_HEADER_AUTH === 'true',
  ssoHeaderName: process.env.SSO_HEADER_NAME || 'X-Remote-User',
  ssoEmailHeader: process.env.SSO_EMAIL_HEADER || 'X-Remote-Email',
  ssoNameHeader: process.env.SSO_NAME_HEADER || 'X-Remote-Name',
  ssoRoleHeader: process.env.SSO_ROLE_HEADER || 'X-Remote-Role',
};
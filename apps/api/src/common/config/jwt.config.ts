export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'change-this-secret-in-production',
  accessTokenExpiresIn: '15m',
  refreshTokenExpiresIn: '7d',
};
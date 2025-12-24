export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'change-this-secret-in-production',
  // Number (seconds) instead of string for @nestjs/jwt compatibility
  accessTokenExpiresIn: 900, // 15 minutes (15 * 60)
  refreshTokenExpiresIn: 604800, // 7 days (7 * 24 * 60 * 60)
};
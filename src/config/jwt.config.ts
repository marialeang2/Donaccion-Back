export const jwtConfig = () => ({
  jwt: {
    secret: process.env.JWT_SECRET || 'tu-clave-secreta-por-defecto',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
});

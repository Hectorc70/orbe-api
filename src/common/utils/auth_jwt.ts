import jwt from 'jsonwebtoken';
import logger from './logger';

const JWT_SECRET =process.env.JWT_SECRET  ?? ''; // Usa una variable de entorno para mayor seguridad
const JWT_EXPIRATION = '24h'; // Configura el tiempo de expiración del token

// Generar un token
export const generateToken = (payload: object): string => {
  logger.info('Generando token para el usuario:', process.env.JWT_SECRET);
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

// Verificar un token
export const verifyToken = (token: string): object | string => {
  return jwt.verify(token, JWT_SECRET);
};
import jwt, { JwtPayload } from 'jsonwebtoken';
import logger from './logger';
import { Request } from 'express';

const JWT_SECRET = process.env.JWT_SECRET ?? '';
const JWT_EXPIRATION = '24h';

// Generar un token
export const generateToken = (payload: object): string => {
  logger.info('Generando token para el usuario:', process.env.JWT_SECRET);
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

// Verificar un token
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Si el payload es string lo convertimos en objeto
    if (typeof decoded === 'string') {
      return { data: decoded } as JwtPayload;
    }
    return decoded as JwtPayload;
  } catch (error) {
    logger.error('Error al verificar token:', error);
    return null;
  }
};


export function getTokenFromHeaders(req: Request): string | undefined {
  const auth = req.headers['authorization'];
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice('Bearer '.length).trim();
  }

  return undefined;
}
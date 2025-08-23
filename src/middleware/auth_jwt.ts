import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';



const JWT_SECRET = process.env.JWT_SECRET ?? '';

interface AuthenticatedRequest extends Request {
  user?: JwtPayload | string;
}

// Middleware para validar el token JWT
export const validateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): any => {
  // Obtén el token del encabezado de autorización
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado: token no proporcionado' });
  }

  // Extraer el token del encabezado
  const token = authHeader.split(' ')[1];

  try {
    // Verifica el token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Agrega la información decodificada a la solicitud para su uso posterior
    req.user = decoded;

    // Continua con la siguiente función de middleware o controlador
    next();
  } catch (error) {
    // Devuelve un error si el token no es válido o ha expirado
    res.status(403).json({ message: 'Token inválido o expirado' });
  }
};
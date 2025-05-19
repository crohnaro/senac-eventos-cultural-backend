// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface AuthRequest extends Request {
  user?: { userId: number; role: string };
}

export const ensureAuth: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token não fornecido.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
    // Aqui fazemos o cast
    (req as AuthRequest).user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido.' });
    return;
  }
};

/**
 * Gera um middleware que verifica se o usuário autenticado tem a role esperada.
 */
export const ensureRole = (role: 'ORGANIZER' | 'PARTICIPANT'): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Cast para AuthRequest
    const authReq = req as AuthRequest;

    // Verifica se já passou pelo ensureAuth
    if (!authReq.user) {
      res.status(401).json({ message: 'Não autenticado.' });
      return;
    }

    // Verifica a role
    if (authReq.user.role !== role) {
      res.status(403).json({ message: 'Acesso negado: permissão insuficiente.' });
      return;
    }

    next();
  };
};

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Tenant from '../models/Tenant';

export interface AuthRequest extends Request {
  tenant?: any;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ mensaje: 'No autorizado, token requerido' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ mensaje: 'Error de configuración del servidor' });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as { id: string };
    const tenant = await Tenant.findById(decoded.id).select('-password');

    if (!tenant || !tenant.activo) {
      res.status(401).json({ mensaje: 'No autorizado, asesor no encontrado o inactivo' });
      return;
    }

    req.tenant = tenant;
    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'No autorizado, token inválido' });
  }
};

export const adminProtect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ mensaje: 'No autorizado' });
      return;
    }

    const adminSecret = process.env.ADMIN_JWT_SECRET;
    if (!adminSecret) {
      res.status(500).json({ mensaje: 'Error de configuración del servidor' });
      return;
    }

    const decoded = jwt.verify(token, adminSecret) as { admin: boolean };

    if (!decoded.admin) {
      res.status(403).json({ mensaje: 'Acceso denegado' });
      return;
    }

    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'No autorizado, token inválido' });
  }
};
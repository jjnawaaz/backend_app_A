import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import Admin from '../models/admin.model';
import logger from '../utils/logger.utils';
import dotenv from 'dotenv'

dotenv.config()

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    console.log(decoded.userId)
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      res.status(401).json({ message: 'Invalid token' });
      return
    }

    (req as any).user = user; // Now properly typed
    next();
  } catch (err) {
    logger.error('Authentication error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const authenticateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const admin = await Admin.findById(decoded.id);
    
    if (!admin) {
      res.status(401).json({ message: 'Invalid token' });
      return
    }

    (req as any).admin = admin; // Now properly typed
    next();
  } catch (err) {
    logger.error('Admin authentication error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};
import { Request, Response } from 'express';
import Admin, { IAdmin } from '../../models/admin.model';
import jwt from 'jsonwebtoken';
import logger from '../../utils/logger.utils';
import { authenticateAdmin } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { createAdminSchema } from '../../validations/admin.validation';

/**
 * Admin Login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Check if admin exists
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      res.status(401).json({ message: 'Invalid credentials' });
      return
    }

    // 2. Verify password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return
    }

    // 3. Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    res.status(200).json({ token });
  } catch (err) {
    logger.error('Admin login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new admin (only accessible by superadmin)
 */
export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    const requestingAdmin = (req as any).admin as IAdmin // From auth middleware

    // Only superadmin can create other admins
    if (requestingAdmin.role !== 'superadmin') {
      res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
      return
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      res.status(400).json({ message: 'Admin already exists' });
      return
    }

    // Create new admin
    const newAdmin = await Admin.create({ name, email, password, role });

    res.status(201).json({
      _id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
      password:password,
      role: newAdmin.role,
      createdAt: newAdmin.createdAt,
    });
  } catch (err) {
    logger.error('Create admin error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all admins (superadmin only)
 */
export const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await Admin.find().select('-password');
    res.status(200).json(admins);
  } catch (err) {
    logger.error('Get admins error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
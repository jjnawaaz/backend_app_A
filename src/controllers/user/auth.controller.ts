import { Request, Response } from 'express';
import User from '../../models/user.model';
import jwt from 'jsonwebtoken';
import logger from '../../utils/logger.utils';
import { sendVerificationEmail } from '../../services/email.service';
import bcrypt from 'bcryptjs';

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { firstName, lastName, email, country, password } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'Email already in use' });
            return;
        }

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            country,
            password,
            verificationToken: jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '1d' })
        });

        // Send verification email
        await sendVerificationEmail(user.email, user.verificationToken!); 

        res.status(201).json({ 
            message: 'User created. Please check your email for verification.' 
        });
    } catch (err) {
        logger.error('Signup error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};



export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // 1. Check if user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
            return;
        }

        // 2. Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
            return;
        }

        // 3. Check if email is verified
        if (!user.isVerified) {
            res.status(403).json({ 
                success: false,
                message: 'Please verify your email first' 
            });
            return;
        }

        // 4. Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: 'user' },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' }
        );

        // 5. Return token and user info (without password)
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });

    } catch (err) {
        logger.error('Login error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};








export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
        const user = await User.findOne({ email: decoded.email });
        
        if (!user) {
            res.status(400).json({ message: 'Invalid token' });
            return;
        }
        
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        
        res.status(200).json({ message: 'Email verified successfully' });
    } catch (err) {
        logger.error('Email verification error:', err);
        res.status(400).json({ message: 'Invalid or expired token' });
    }
};




import jwt, { SignOptions } from 'jsonwebtoken';
import logger from './logger.utils';
import { IUser } from '../models/user.model';
import { IAdmin } from '../models/admin.model';

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

interface TokenPayload {
    id: string;
    [key: string]: any;
}

/**
 * Generate JWT token with proper typing
 */
/**
 * Generate JWT token with proper typing
 */
export function generateToken(
    payload: TokenPayload,
    expiresIn: string | number = '1d'
): string {
    let options: SignOptions = {};

    if (typeof expiresIn === 'string') {
        // Simple conversion without external package
        const match = expiresIn.match(/^(\d+)([smhd])$/);
        if (!match) throw new Error('Invalid expiresIn format. Use formats like "1d", "2h", "30m"');
        
        const [, num, unit] = match;
        const value = parseInt(num);
        
        switch (unit) {
            case 's': options.expiresIn = value; break;
            case 'm': options.expiresIn = value * 60; break;
            case 'h': options.expiresIn = value * 60 * 60; break;
            case 'd': options.expiresIn = value * 60 * 60 * 24; break;
            default: throw new Error('Invalid time unit');
        }
    } else {
        options.expiresIn = expiresIn;
    }

    return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Verify JWT token with proper typing
 */
export function verifyToken(token: string): TokenPayload {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (err) {
        logger.error('JWT verification failed:', err);
        throw new Error('Invalid or expired token');
    }
}

/**
 * Generate tokens for user with proper typing
 */
export function generateUserTokens(user: IUser) {
    if (!user._id) {
        throw new Error('User ID is required');
    }

    const accessToken = generateToken(
        { 
            id: user._id.toString(), // Now properly typed
            email: user.email 
        },
        process.env.JWT_EXPIRES_IN || '1d'
    );
    
    const refreshToken = generateToken(
        { 
            id: user._id.toString() // Now properly typed
        },
        process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
    );
    
    return { accessToken, refreshToken };
}


/**
 * Generate tokens for admin with proper typing
 */
export function generateAdminTokens(admin: IAdmin) {
    if (!admin._id) {
        throw new Error('Admin ID is required');
    }

    const accessToken = generateToken(
        { 
            id: admin._id.toString(), // Now properly typed
            role: admin.role 
        },
        process.env.JWT_EXPIRES_IN || '1d'
    );
    
    return { accessToken };
}
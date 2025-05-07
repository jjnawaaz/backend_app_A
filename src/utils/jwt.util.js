"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.generateUserTokens = generateUserTokens;
exports.generateAdminTokens = generateAdminTokens;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_utils_1 = __importDefault(require("./logger.utils"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}
/**
 * Generate JWT token with proper typing
 */
/**
 * Generate JWT token with proper typing
 */
function generateToken(payload, expiresIn = '1d') {
    let options = {};
    if (typeof expiresIn === 'string') {
        // Simple conversion without external package
        const match = expiresIn.match(/^(\d+)([smhd])$/);
        if (!match)
            throw new Error('Invalid expiresIn format. Use formats like "1d", "2h", "30m"');
        const [, num, unit] = match;
        const value = parseInt(num);
        switch (unit) {
            case 's':
                options.expiresIn = value;
                break;
            case 'm':
                options.expiresIn = value * 60;
                break;
            case 'h':
                options.expiresIn = value * 60 * 60;
                break;
            case 'd':
                options.expiresIn = value * 60 * 60 * 24;
                break;
            default: throw new Error('Invalid time unit');
        }
    }
    else {
        options.expiresIn = expiresIn;
    }
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
}
/**
 * Verify JWT token with proper typing
 */
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (err) {
        logger_utils_1.default.error('JWT verification failed:', err);
        throw new Error('Invalid or expired token');
    }
}
/**
 * Generate tokens for user with proper typing
 */
function generateUserTokens(user) {
    if (!user._id) {
        throw new Error('User ID is required');
    }
    const accessToken = generateToken({
        id: user._id.toString(), // Now properly typed
        email: user.email
    }, process.env.JWT_EXPIRES_IN || '1d');
    const refreshToken = generateToken({
        id: user._id.toString() // Now properly typed
    }, process.env.REFRESH_TOKEN_EXPIRES_IN || '7d');
    return { accessToken, refreshToken };
}
/**
 * Generate tokens for admin with proper typing
 */
function generateAdminTokens(admin) {
    if (!admin._id) {
        throw new Error('Admin ID is required');
    }
    const accessToken = generateToken({
        id: admin._id.toString(), // Now properly typed
        role: admin.role
    }, process.env.JWT_EXPIRES_IN || '1d');
    return { accessToken };
}

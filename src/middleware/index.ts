import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.utils';

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        error: {
            code: 404,
            description: 'The requested endpoint does not exist'
        }
    });
};

/**
 * Global Error Handler
 */
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    logger.error(`Error: ${err.message}`);
    
    if (err.name === 'ValidationError') {
        res.status(400).json({
            success: false,
            message: 'Validation Error',
            error: {
                code: 400,
                description: err.message
            }
        });
        return;
    }

    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            message: 'Authentication Failed',
            error: {
                code: 401,
                description: 'Invalid or expired token'
            }
        });
        return;
    }

    // Default error handler
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: {
            code: 500,
            description: err.message || 'Something went wrong'
        }
    });
};
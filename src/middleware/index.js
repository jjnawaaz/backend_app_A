"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
const logger_utils_1 = __importDefault(require("../utils/logger.utils"));
/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        error: {
            code: 404,
            description: 'The requested endpoint does not exist'
        }
    });
};
exports.notFoundHandler = notFoundHandler;
/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
    logger_utils_1.default.error(`Error: ${err.message}`);
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
exports.errorHandler = errorHandler;

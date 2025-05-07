"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = exports.login = exports.signup = void 0;
const user_model_1 = __importDefault(require("../../models/user.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_utils_1 = __importDefault(require("../../utils/logger.utils"));
const email_service_1 = require("../../services/email.service");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, email, country, password } = req.body;
        // Check if user exists
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'Email already in use' });
            return;
        }
        // Create user
        const user = yield user_model_1.default.create({
            firstName,
            lastName,
            email,
            country,
            password,
            verificationToken: jsonwebtoken_1.default.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' })
        });
        // Send verification email
        yield (0, email_service_1.sendVerificationEmail)(user.email, user.verificationToken);
        res.status(201).json({
            message: 'User created. Please check your email for verification.'
        });
    }
    catch (err) {
        logger_utils_1.default.error('Signup error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.signup = signup;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // 1. Check if user exists
        const user = yield user_model_1.default.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }
        // 2. Check if password matches
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
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
        const token = jsonwebtoken_1.default.sign({ userId: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
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
    }
    catch (err) {
        logger_utils_1.default.error('Login error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
exports.login = login;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = yield user_model_1.default.findOne({ email: decoded.email });
        if (!user) {
            res.status(400).json({ message: 'Invalid token' });
            return;
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        yield user.save();
        res.status(200).json({ message: 'Email verified successfully' });
    }
    catch (err) {
        logger_utils_1.default.error('Email verification error:', err);
        res.status(400).json({ message: 'Invalid or expired token' });
    }
});
exports.verifyEmail = verifyEmail;

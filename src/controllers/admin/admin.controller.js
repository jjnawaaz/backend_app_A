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
exports.getAllAdmins = exports.createAdmin = exports.login = void 0;
const admin_model_1 = __importDefault(require("../../models/admin.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_utils_1 = __importDefault(require("../../utils/logger.utils"));
/**
 * Admin Login
 */
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // 1. Check if admin exists
        const admin = yield admin_model_1.default.findOne({ email }).select('+password');
        if (!admin) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        // 2. Verify password
        const isMatch = yield admin.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        // 3. Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ token });
    }
    catch (err) {
        logger_utils_1.default.error('Admin login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.login = login;
/**
 * Create a new admin (only accessible by superadmin)
 */
const createAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, role } = req.body;
        const requestingAdmin = req.admin; // From auth middleware
        // Only superadmin can create other admins
        if (requestingAdmin.role !== 'superadmin') {
            res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
            return;
        }
        // Check if admin already exists
        const existingAdmin = yield admin_model_1.default.findOne({ email });
        if (existingAdmin) {
            res.status(400).json({ message: 'Admin already exists' });
            return;
        }
        // Create new admin
        const newAdmin = yield admin_model_1.default.create({ name, email, password, role });
        res.status(201).json({
            _id: newAdmin._id,
            name: newAdmin.name,
            email: newAdmin.email,
            password: password,
            role: newAdmin.role,
            createdAt: newAdmin.createdAt,
        });
    }
    catch (err) {
        logger_utils_1.default.error('Create admin error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createAdmin = createAdmin;
/**
 * Get all admins (superadmin only)
 */
const getAllAdmins = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admins = yield admin_model_1.default.find().select('-password');
        res.status(200).json(admins);
    }
    catch (err) {
        logger_utils_1.default.error('Get admins error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAllAdmins = getAllAdmins;

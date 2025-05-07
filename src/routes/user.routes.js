"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController = __importStar(require("../controllers/user/auth.controller"));
const groupController = __importStar(require("../controllers/user/group.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const user_validation_1 = require("../validations/user.validation");
const router = (0, express_1.Router)();
// Auth routes
router.post('/signup', (0, validation_middleware_1.validate)(user_validation_1.signupSchema), authController.signup);
router.post('/login', (0, validation_middleware_1.validate)(user_validation_1.loginSchema), authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
// Group routes
router.post('/groups', auth_middleware_1.authenticateUser, groupController.createGroup);
router.post('/groups/:groupId/join', auth_middleware_1.authenticateUser, groupController.joinGroup);
router.post('/groups/:groupId/leave', auth_middleware_1.authenticateUser, groupController.leaveGroup);
exports.default = router;

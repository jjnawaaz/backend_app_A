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
exports.initializeWebSocket = initializeWebSocket;
const socket_io_1 = require("socket.io");
const jwt_util_1 = require("../utils/jwt.util");
const user_model_1 = __importDefault(require("../models/user.model"));
const group_model_1 = __importDefault(require("../models/group.model"));
const activeUsers = new Map();
const activeGroups = new Map();
function initializeWebSocket(server) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.WS_CORS_ORIGIN || '*',
            methods: ['GET', 'POST']
        },
        path: process.env.WS_PATH || '/socket.io'
    });
    io.use((socket, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const token = socket.handshake.auth.token;
            const decoded = (0, jwt_util_1.verifyToken)(token);
            const user = yield user_model_1.default.findById(decoded.id);
            if (!user)
                return next(new Error('Authentication error'));
            socket.data.user = user;
            activeUsers.set(user.id, socket);
            next();
        }
        catch (err) {
            next(new Error('Authentication error'));
        }
    }));
    io.on('connection', (socket) => {
        // User-to-user messaging
        socket.on('private_message', (_a) => __awaiter(this, [_a], void 0, function* ({ to, content }) {
            const recipient = activeUsers.get(to);
            if (recipient) {
                recipient.emit('private_message', {
                    from: socket.data.user.id,
                    content,
                    timestamp: new Date()
                });
            }
        }));
        // Group messaging
        socket.on('join_group', (groupId) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const group = yield group_model_1.default.findById(groupId);
            if (group && group.members.includes(socket.data.user.id)) {
                if (!activeGroups.has(groupId)) {
                    activeGroups.set(groupId, new Set());
                }
                (_a = activeGroups.get(groupId)) === null || _a === void 0 ? void 0 : _a.add(socket.data.user.id);
                socket.join(groupId);
            }
        }));
        socket.on('group_message', (_a) => __awaiter(this, [_a], void 0, function* ({ groupId, content }) {
            var _b;
            if ((_b = activeGroups.get(groupId)) === null || _b === void 0 ? void 0 : _b.has(socket.data.user.id)) {
                io.to(groupId).emit('group_message', {
                    from: socket.data.user.id,
                    content,
                    timestamp: new Date()
                });
            }
        }));
        socket.on('leave_group', (groupId) => {
            var _a;
            (_a = activeGroups.get(groupId)) === null || _a === void 0 ? void 0 : _a.delete(socket.data.user.id);
            socket.leave(groupId);
        });
        socket.on('disconnect', () => {
            activeUsers.delete(socket.data.user.id);
        });
    });
    return io;
}

import { Server } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt.util';
import User from '../models/user.model';
import Group from '../models/group.model';

const activeUsers: Map<string, Socket> = new Map();
const activeGroups: Map<string, Set<string>> = new Map();

export function initializeWebSocket(server: Server): SocketServer {
    const io = new SocketServer(server, {
        cors: {
            origin: process.env.WS_CORS_ORIGIN || '*',
            methods: ['GET', 'POST']
        },
        path: process.env.WS_PATH || '/socket.io'
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            const decoded = verifyToken(token);
            const user = await User.findById(decoded.id);
            if (!user) return next(new Error('Authentication error'));
            socket.data.user = user;
            activeUsers.set(user.id, socket);
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        // User-to-user messaging
        socket.on('private_message', async ({ to, content }) => {
            const recipient = activeUsers.get(to);
            if (recipient) {
                recipient.emit('private_message', {
                    from: socket.data.user.id,
                    content,
                    timestamp: new Date()
                });
            }
        });

        // Group messaging
        socket.on('join_group', async (groupId) => {
            const group = await Group.findById(groupId);
            if (group && group.members.includes(socket.data.user.id)) {
                if (!activeGroups.has(groupId)) {
                    activeGroups.set(groupId, new Set());
                }
                activeGroups.get(groupId)?.add(socket.data.user.id);
                socket.join(groupId);
            }
        });

        socket.on('group_message', async ({ groupId, content }) => {
            if (activeGroups.get(groupId)?.has(socket.data.user.id)) {
                io.to(groupId).emit('group_message', {
                    from: socket.data.user.id,
                    content,
                    timestamp: new Date()
                });
            }
        });

        socket.on('leave_group', (groupId) => {
            activeGroups.get(groupId)?.delete(socket.data.user.id);
            socket.leave(groupId);
        });

        socket.on('disconnect', () => {
            activeUsers.delete(socket.data.user.id);
        });
    });

    return io;
}
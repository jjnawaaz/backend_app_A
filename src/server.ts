import http from 'http';
import { app } from './app';
import logger from './utils/logger.utils';
import connectDB from './config/database.config';
import { initializeWebSocket } from './services/websocket.service'; // Add this import

const PORT = process.env.PORT || 3000;

// Start the server
async function startServer() {
    // Connect to database
    await connectDB();
    
    // Create HTTP server
    const httpServer = http.createServer(app);
    
    // Initialize WebSocket server
    initializeWebSocket(httpServer);
    
    httpServer.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
        logger.info(`User Swagger docs available at http://localhost:${PORT}/api/docs/user`);
        logger.info(`Admin Swagger docs available at http://localhost:${PORT}/api/docs/admin`);
    });
}

startServer().catch(err => {
    logger.error('Server failed to start:', err);
    process.exit(1);
});
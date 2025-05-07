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
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const logger_utils_1 = __importDefault(require("./utils/logger.utils"));
const database_config_1 = __importDefault(require("./config/database.config"));
const websocket_service_1 = require("./services/websocket.service"); // Add this import
const PORT = process.env.PORT || 3000;
// Start the server
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        // Connect to database
        yield (0, database_config_1.default)();
        // Create HTTP server
        const httpServer = http_1.default.createServer(app_1.app);
        // Initialize WebSocket server
        (0, websocket_service_1.initializeWebSocket)(httpServer);
        httpServer.listen(PORT, () => {
            logger_utils_1.default.info(`Server running on port ${PORT}`);
            logger_utils_1.default.info(`User Swagger docs available at http://localhost:${PORT}/api/docs/user`);
            logger_utils_1.default.info(`Admin Swagger docs available at http://localhost:${PORT}/api/docs/admin`);
        });
    });
}
startServer().catch(err => {
    logger_utils_1.default.error('Server failed to start:', err);
    process.exit(1);
});

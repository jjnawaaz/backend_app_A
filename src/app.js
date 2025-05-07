"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const path_1 = __importDefault(require("path"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const middleware_1 = require("./middleware");
const logger_utils_1 = __importDefault(require("./utils/logger.utils"));
const dotenv_1 = __importDefault(require("dotenv"));
const app = (0, express_1.default)();
exports.app = app;
// Security middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
dotenv_1.default.config();
// Logging
app.use((0, morgan_1.default)('combined', {
    stream: {
        write: (message) => logger_utils_1.default.info(message.trim()),
    },
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
});
app.use(limiter);
// Swagger documentation - move this BEFORE route declarations
const userSwaggerSpec = yamljs_1.default.load(path_1.default.join(__dirname, './docs/user-swagger.yaml'));
const adminSwaggerSpec = yamljs_1.default.load(path_1.default.join(__dirname, './docs/admin-swagger.yaml'));
// Serve Swagger UI at different endpoints
app.use('/api/docs/user', swagger_ui_express_1.default.serveFiles(userSwaggerSpec), swagger_ui_express_1.default.setup(userSwaggerSpec));
app.use('/api/docs/admin', swagger_ui_express_1.default.serveFiles(adminSwaggerSpec), swagger_ui_express_1.default.setup(adminSwaggerSpec));
// Routes
app.use('/api/users', user_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});
// Error handling
app.use(middleware_1.errorHandler);
app.use(middleware_1.notFoundHandler);

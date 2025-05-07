import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler, notFoundHandler } from './middleware';
import logger from './utils/logger.utils';
import dotenv from 'dotenv'

const app = express();

// Security middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

dotenv.config()

// Logging
app.use(morgan('combined', {
    stream: {
        write: (message: string) => logger.info(message.trim()),
    },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
});
app.use(limiter);

// Swagger documentation - move this BEFORE route declarations
const userSwaggerSpec = YAML.load(path.join(__dirname, './docs/user-swagger.yaml'));
const adminSwaggerSpec = YAML.load(path.join(__dirname, './docs/admin-swagger.yaml'));

// Serve Swagger UI at different endpoints
app.use('/api/docs/user', 
  swaggerUi.serveFiles(userSwaggerSpec),
  swaggerUi.setup(userSwaggerSpec)
);

app.use('/api/docs/admin',
  swaggerUi.serveFiles(adminSwaggerSpec),
  swaggerUi.setup(adminSwaggerSpec)
);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Error handling
app.use(errorHandler);
app.use(notFoundHandler);

export { app };
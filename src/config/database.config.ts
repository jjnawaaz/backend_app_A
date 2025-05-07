import mongoose from 'mongoose';
import logger from '../utils/logger.utils';

async function connectDB() {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI!);
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        logger.error('Database connection error:', err);
        process.exit(1);
    }
}

export default connectDB;
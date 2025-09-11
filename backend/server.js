import express from 'express';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { authMiddleware } from './middleware/authMiddleware.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());

// Kết nối MongoDB
connectDB();

// các routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', authMiddleware, taskRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
import express from 'express';
import cors from 'cors';  
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { authMiddleware } from './middleware/authMiddleware.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

// Cấu hình CORS
app.use(cors({
  origin: 'http://localhost:5173', // Cho phép React dev server (port 5173)
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các phương thức cho phép
  credentials: true, // Nếu dùng cookie/token (có thể bỏ nếu không cần)
}));

app.use(express.json());

// Kết nối MongoDB
connectDB();

//debug register
app.use((req, res, next) => {
  console.log('Received request:', req.method, req.originalUrl, 'from:', req.get('origin'));
  next();
});

// các routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', authMiddleware, taskRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

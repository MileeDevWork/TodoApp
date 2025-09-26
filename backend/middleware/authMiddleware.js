// import jwt from 'jsonwebtoken';
// import 'dotenv/config'; // Load .env

// export const authMiddleware = async (req, res, next) => {
//   try {
//     console.log('All headers:', req.headers);
//     console.log('Authorization header:', req.header('Authorization'));
//     const token = req.header('Authorization')?.replace('Bearer ', '');
//     if (!token) return res.status(401).json({ message: 'No token provided' });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log('Decoded token:', decoded); // Kiểm tra userId từ token
//     req.user = decoded; // Gán userId từ token
//     next();
//   } catch (error) {
//     res.status(401).json({ message: 'Invalid token' });
//   }
// };

import jwt from 'jsonwebtoken';
import 'dotenv/config';

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);

        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: 'Invalid token format' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};
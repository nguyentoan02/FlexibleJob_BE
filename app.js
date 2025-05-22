import express from 'express';
import connectDB from './config/db.js';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
dotenv.config();

const app = express();
connectDB();
app.use(cors());
app.use(express.json());

//log requests to the console
app.use(morgan('dev'));



app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');
// const userRoutes = require('./routes/userRoutes'); // Add later
const cookieParser = require('cookie-parser'); // <--- Import

const app = express();

// 1. Connect Database
connectDB();

// 2. Middlewares
app.use(helmet()); // Adds security headers
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json()); // Parses JSON bodies
app.use(cookieParser());

// 3. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

// 4. Global Error Handler (Must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
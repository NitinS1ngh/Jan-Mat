require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const proposalRoutes = require('./routes/proposals');
const commentRoutes = require('./routes/comments');
const { router: adminRoutes } = require('./routes/admin');
const auth = require('./middleware/auth');
const { startWeeklyJob } = require('./jobs/weeklyAnalysis');

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from any localhost port (Vite may pick 5173, 5174, etc.) + no origin (curl/Postman)
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
const { register, login, me, verifyOtp, resendOtp } = require('./routes/auth');
const authRouter = express.Router();
authRouter.post('/register', register);
authRouter.post('/verify-otp', verifyOtp);
authRouter.post('/resend-otp', resendOtp);
authRouter.post('/login', login);
authRouter.get('/me', auth, me);
app.use('/api/auth', authRouter);

app.use('/api/proposals', proposalRoutes);
app.use('/api/proposals', commentRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// 404
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Connect MongoDB and start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Jan-Mat server running on port ${PORT}`));
    startWeeklyJob();
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on ${port}`));

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://eternal-vows-kpam.vercel.app/',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/vendors', require('./src/routes/vendors'));
app.use('/api/inquiries', require('./src/routes/inquiries'));
app.use('/api/dashboard', require('./src/routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Eternal Vows API is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// DB connection + Server start
const PORT = process.env.PORT || 5000;

// mongoose
//   .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eternal-vows')
//   .then(() => {
//     console.log('✅ MongoDB connected');
//     app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
//   })
//   .catch((err) => {
//     console.error('❌ MongoDB connection error:', err);
//     process.exit(1);
//   });
let isConnected = false;
async function connectToMongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eternal-vows', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}
app.use((req , res ,next)=>{
  if(!isConnected){
    connectToMongoDB();
  }
  next();
})

app.use('/api/events' , eventRoutes);
app.use('/api/notifications' , notificationRoutes);
module.exports = app;

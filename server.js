require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Subscriber = require('./models/Subscriber');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// 允许所有来源跨域，因为有多个官网需要调用
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/email-collection-db';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('Email Collection Service is Running');
});

/**
 * 通用邮箱收集接口
 * POST /api/subscribe
 * Body: { email, source, ...metadata }
 */
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email, source, pageUrl, referrer } = req.body;

    // 基本验证
    if (!email || !source) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and Source are required fields.' 
      });
    }

    // 获取客户端信息
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // 创建记录
    const newSubscriber = new Subscriber({
      email,
      source,
      metadata: {
        pageUrl,
        referrer,
        ip,
        userAgent
      }
    });

    await newSubscriber.save();

    console.log(`[${source}] New email collected: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Email collected successfully.'
    });

  } catch (error) {
    console.error('Error collecting email:', error);
    
    // 处理 Mongoose 验证错误
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error. Please try again later.'
    });
  }
});

// Start Server
// 适配 Vercel：只有在非 Serverless 环境下（如本地开发）才监听端口
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;


const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
  },
  // source 字段用来区分是哪个官网来的，例如 "product-a", "product-b"
  source: {
    type: String,
    required: [true, 'Source is required'], 
    trim: true,
    index: true // 给 source 加索引，方便后续按项目查询
  },
  // 额外的元数据，例如具体页面URL、用户IP、设备信息等
  metadata: {
    userAgent: String,
    ip: String,
    pageUrl: String,
    referrer: String
  }
}, {
  timestamps: true // 自动生成 createdAt 和 updatedAt
});

// 复合索引，防止同一个邮箱在同一个 source 下重复提交（可选，看业务需求）
// 这里暂不做唯一限制，允许重复提交，或者可以在逻辑层控制
// subscriberSchema.index({ email: 1, source: 1 }, { unique: true });

module.exports = mongoose.model('Subscriber', subscriberSchema);


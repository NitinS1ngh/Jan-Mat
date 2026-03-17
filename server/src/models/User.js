const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['citizen', 'admin'], default: 'citizen' },
  phone: { type: String, default: null },           // optional, for SMS notifications
  aadhaarVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false }, // set true after OTP
  otp: { type: String, default: null },              // bcrypt-hashed OTP
  otpExpiresAt: { type: Date, default: null },
  votedProposals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Proposal' }],
  downvotedProposals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Proposal' }],
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

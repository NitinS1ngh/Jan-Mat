const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  category: {
    type: String,
    required: true,
    enum: ['Health', 'Technology', 'Education', 'Environment', 'Economy', 'Infrastructure', 'Social Justice', 'Agriculture', 'Defence', 'Other'],
  },
  description: { type: String, required: true, minlength: 100 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  upvoteCount: { type: Number, default: 0 },
  downvoteCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Active', 'Top5', 'Under Discussion', 'Passed', 'Rejected', 'Needs Revision', 'Archived'],
    default: 'Active',
  },
  // AI Analysis fields
  aiSummary: { type: String, default: null },
  whyItMatters: { type: String, default: null },
  constitutionalScore: { type: Number, min: 0, max: 100, default: null },
  constitutionalAnalysis: { type: String, default: null },
  contradictedArticles: [{ type: String }],
  impactScore: { type: Number, min: 0, max: 100, default: null },
  sentimentSummary: { type: String, default: null },
  // Legislative Timeline tracking
  timelineStage: {
    type: String,
    enum: ['Drafted', 'Community Voting', 'AI Constitutional Check', 'Sent to Parliament'],
    default: 'Community Voting',
  },
  // Parliament Decision
  parliamentDecision: {
    type: String,
    enum: ['Made into Law', 'Rejected by Parliament', 'Under Parliamentary Review', null],
    default: null,
  },
  parliamentDecisionNote: { type: String, default: null },
  parliamentDecisionAt: { type: Date, default: null },
  analysedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

proposalSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

proposalSchema.index({ upvoteCount: -1 });
proposalSchema.index({ createdAt: -1 });
proposalSchema.index({ status: 1 });
proposalSchema.index({ category: 1 });

module.exports = mongoose.model('Proposal', proposalSchema);

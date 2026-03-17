const express = require('express');
const router = express.Router();
const Proposal = require('../models/Proposal');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { runAIAnalysis } = require('../services/openai');

// GET /api/admin/top5 — get current Top 5 + needs revision
router.get('/top5', auth, adminOnly, async (req, res) => {
  try {
    const top5 = await Proposal.find({ status: 'Top5' })
      .sort({ constitutionalScore: -1 })
      .populate('author', 'name email');
    const needsRevision = await Proposal.find({ status: 'Needs Revision' })
      .populate('author', 'name email');
    res.json({ top5, needsRevision });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/admin/proposals/:id/status — update proposal status
router.put('/proposals/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status, timelineStage } = req.body;
    const validStatuses = ['Active', 'Top5', 'Under Discussion', 'Passed', 'Rejected', 'Needs Revision', 'Archived'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const proposal = await Proposal.findByIdAndUpdate(
      req.params.id,
      { status, ...(timelineStage && { timelineStage }), updatedAt: Date.now() },
      { new: true }
    ).populate('author', 'name email');

    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    res.json({ proposal });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/admin/parliament-proposals — proposals sent to parliament
router.get('/parliament-proposals', auth, adminOnly, async (req, res) => {
  try {
    const proposals = await Proposal.find({ timelineStage: 'Sent to Parliament' })
      .sort({ updatedAt: -1 })
      .populate('author', 'name email');
    res.json({ proposals });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/admin/proposals/:id/parliament-decision — record parliament verdict
router.put('/proposals/:id/parliament-decision', auth, adminOnly, async (req, res) => {
  try {
    const { decision, note } = req.body;
    const validDecisions = ['Made into Law', 'Rejected by Parliament', 'Under Parliamentary Review'];
    if (!validDecisions.includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision value' });
    }
    const proposal = await Proposal.findByIdAndUpdate(
      req.params.id,
      {
        parliamentDecision: decision,
        parliamentDecisionNote: note || null,
        parliamentDecisionAt: new Date(),
        updatedAt: Date.now(),
      },
      { new: true }
    ).populate('author', 'name email');
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    res.json({ proposal });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/admin/trigger-analysis — manually trigger AI analysis
router.post('/trigger-analysis', auth, adminOnly, async (req, res) => {
  try {
    await runWeeklyAnalysis();
    res.json({ message: 'AI analysis completed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Analysis failed', error: err.message });
  }
});

// GET /api/admin/stats — overall stats
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const total = await Proposal.countDocuments();
    const active = await Proposal.countDocuments({ status: 'Active' });
    const top5 = await Proposal.countDocuments({ status: 'Top5' });
    const passed = await Proposal.countDocuments({ status: 'Passed' });
    const needsRevision = await Proposal.countDocuments({ status: 'Needs Revision' });
    res.json({ total, active, top5, passed, needsRevision });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

async function runWeeklyAnalysis() {
  // Clear previous Top5 back to Active
  await Proposal.updateMany({ status: 'Top5' }, { status: 'Active', timelineStage: 'Community Voting' });
  await Proposal.updateMany({ status: 'Needs Revision' }, { status: 'Active', timelineStage: 'Community Voting' });

  const topProposals = await Proposal.find({ status: 'Active' })
    .sort({ upvoteCount: -1 })
    .limit(50)
    .populate('author', 'name');

  if (topProposals.length === 0) return;

  const result = await runAIAnalysis(topProposals);

  // Apply Top 5 results
  for (const item of result.top5) {
    await Proposal.findByIdAndUpdate(item.proposalId, {
      status: 'Top5',
      timelineStage: 'AI Constitutional Check',
      whyItMatters: item.whyItMatters,
      constitutionalScore: item.constitutionalScore,
      constitutionalAnalysis: item.constitutionalAnalysis,
      impactScore: item.impactScore,
      sentimentSummary: item.sentimentSummary,
      analysedAt: new Date(),
    });
  }

  // Apply Needs Revision results
  for (const item of result.needsRevision) {
    await Proposal.findByIdAndUpdate(item.proposalId, {
      status: 'Needs Revision',
      aiSummary: item.reason,
      analysedAt: new Date(),
    });
  }
}

module.exports = { router, runWeeklyAnalysis };

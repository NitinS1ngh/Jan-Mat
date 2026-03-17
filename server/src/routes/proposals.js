const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Proposal = require('../models/Proposal');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendProposalAcknowledgementSMS } = require('../services/sms');

// GET /api/proposals — list with search, sort, pagination
router.get('/', async (req, res) => {
  try {
    const { search, category, sort = 'newest', page = 1, limit = 12 } = req.query;
    const query = {};
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
    if (category) query.category = category;

    const sortMap = {
      newest: { createdAt: -1 },
      upvotes: { upvoteCount: -1 },
      discussed: { upvoteCount: -1, downvoteCount: -1 },
    };
    const sortOpt = sortMap[sort] || { createdAt: -1 };

    const total = await Proposal.countDocuments(query);
    const proposals = await Proposal.find(query)
      .sort(sortOpt)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('author', 'name aadhaarVerified');

    res.json({ proposals, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/proposals/top5
router.get('/top5', async (req, res) => {
  try {
    const proposals = await Proposal.find({ status: 'Top5' })
      .sort({ constitutionalScore: -1 })
      .populate('author', 'name aadhaarVerified');
    res.json({ proposals });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/proposals/laws — all proposals made into law (public)
router.get('/laws', async (req, res) => {
  try {
    const proposals = await Proposal.find({ parliamentDecision: 'Made into Law' })
      .sort({ parliamentDecisionAt: -1 })
      .populate('author', 'name aadhaarVerified');
    res.json({ proposals });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/proposals/stats
router.get('/stats', async (req, res) => {
  try {
    const proposalsCount = await Proposal.countDocuments();
    const usersCount = await User.countDocuments();
    res.json({ proposalsCount, usersCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/proposals/:id
router.get('/:id', async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate('author', 'name aadhaarVerified createdAt');
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    res.json({ proposal });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/proposals — create (auth required)
router.post(
  '/',
  auth,
  [
    body('title').trim().notEmpty().isLength({ max: 200 }),
    body('category').notEmpty(),
    body('description').notEmpty().isLength({ min: 100 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { title, category, description } = req.body;
      const proposal = await Proposal.create({
        title,
        category,
        description,
        author: req.user._id,
        timelineStage: 'Community Voting',
      });
      await proposal.populate('author', 'name aadhaarVerified phone');

      // Fire and forget SMS acknowledgement
      if (proposal.author.phone) {
        sendProposalAcknowledgementSMS(proposal.author.phone, proposal.author.name, proposal.title);
      }

      res.status(201).json({ proposal });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// PUT /api/proposals/:id/vote — upvote or downvote (auth required)
router.put('/:id/vote', auth, async (req, res) => {
  try {
    const { type } = req.body; // 'up' | 'down'
    if (!['up', 'down'].includes(type)) return res.status(400).json({ message: 'Invalid vote type' });

    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

    const user = await User.findById(req.user._id);
    const hasUpvoted = user.votedProposals.includes(proposal._id);
    const hasDownvoted = user.downvotedProposals.includes(proposal._id);

    if (type === 'up') {
      if (hasUpvoted) {
        // Toggle off
        user.votedProposals = user.votedProposals.filter((id) => !id.equals(proposal._id));
        proposal.upvoteCount = Math.max(0, proposal.upvoteCount - 1);
      } else {
        if (hasDownvoted) {
          user.downvotedProposals = user.downvotedProposals.filter((id) => !id.equals(proposal._id));
          proposal.downvoteCount = Math.max(0, proposal.downvoteCount - 1);
        }
        user.votedProposals.push(proposal._id);
        proposal.upvoteCount += 1;
      }
    } else {
      if (hasDownvoted) {
        user.downvotedProposals = user.downvotedProposals.filter((id) => !id.equals(proposal._id));
        proposal.downvoteCount = Math.max(0, proposal.downvoteCount - 1);
      } else {
        if (hasUpvoted) {
          user.votedProposals = user.votedProposals.filter((id) => !id.equals(proposal._id));
          proposal.upvoteCount = Math.max(0, proposal.upvoteCount - 1);
        }
        user.downvotedProposals.push(proposal._id);
        proposal.downvoteCount += 1;
      }
    }

    await user.save();
    await proposal.save();
    res.json({
      upvoteCount: proposal.upvoteCount,
      downvoteCount: proposal.downvoteCount,
      userVote: user.votedProposals.includes(proposal._id)
        ? 'up'
        : user.downvotedProposals.includes(proposal._id)
        ? 'down'
        : null,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

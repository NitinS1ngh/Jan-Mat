const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// GET /api/proposals/:id/comments
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ proposal: req.params.id })
      .sort({ createdAt: -1 })
      .populate('author', 'name aadhaarVerified');
    res.json({ comments });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/proposals/:id/comments — auth required
router.post(
  '/:id/comments',
  auth,
  [body('body').trim().notEmpty().isLength({ max: 1000 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const comment = await Comment.create({
        proposal: req.params.id,
        author: req.user._id,
        body: req.body.body,
      });
      await comment.populate('author', 'name aadhaarVerified');
      res.status(201).json({ comment });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

module.exports = router;

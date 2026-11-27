const express = require('express');
const {
  listIssues,
  findIssueById,
  createIssue,
  toggleUpvote,
  addComment,
  updateIssueAdmin,
  deleteIssue,
} = require('../data/store');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

const CATEGORY_DEPARTMENTS = {
  Pothole: 'Roads & Highways',
  Garbage: 'Solid Waste Management',
  Streetlight: 'Electrical & Lighting',
  'Water Leak': 'Water Supply & Sewerage',
  Drainage: 'Stormwater Drainage',
  'Traffic Signal': 'Traffic Engineering',
  'Public Safety': 'Municipal Enforcement',
  Other: 'Public Works',
};

router.get('/', async (req, res) => {
  try {
    const { status, category, search, sort } = req.query;
    const issues = await listIssues({ status, category, search, sort });
    return res.json({ issues });
  } catch (err) {
    console.error('[Issues/List]', err);
    return res.status(500).json({ error: 'Failed to fetch issues.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const issue = await findIssueById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found.' });
    return res.json({ issue });
  } catch (err) {
    console.error('[Issues/Get]', err);
    return res.status(500).json({ error: 'Failed to fetch issue.' });
  }
});

router.post('/', requireAuth, upload.single('photo'), async (req, res) => {
  try {
    const { title, description, category, address, lat, lng, priority } = req.body;
    if (!title || !description || !category || !address) {
      return res.status(400).json({ error: 'Title, description, category, and location address are required.' });
    }

    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    const finalLat = Number.isFinite(parsedLat) ? parsedLat : 13.0827;
    const finalLng = Number.isFinite(parsedLng) ? parsedLng : 80.2707;

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const department = CATEGORY_DEPARTMENTS[category] || 'Public Works';

    const issue = await createIssue({
      title: title.trim(),
      description: description.trim(),
      category,
      status: 'Open',
      priority: priority || 'Medium',
      department,
      location: {
        address: address.trim(),
        lat: finalLat,
        lng: finalLng,
      },
      photoUrl,
      reportedBy: {
        userId: req.user.id,
        name: req.user.name,
      },
      upvotes: [req.user.id],
      resolutionNote: '',
      comments: [],
      statusHistory: [
        {
          status: 'Open',
          note: 'Issue reported by citizen.',
          updatedBy: req.user.name,
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    return res.status(201).json({ issue });
  } catch (err) {
    console.error('[Issues/Create]', err);
    return res.status(500).json({ error: err.message || 'Failed to create issue.' });
  }
});

router.post('/:id/upvote', requireAuth, async (req, res) => {
  try {
    const issue = await toggleUpvote(req.params.id, req.user.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found.' });
    return res.json({ issue });
  } catch (err) {
    console.error('[Issues/Upvote]', err);
    return res.status(500).json({ error: 'Failed to toggle upvote.' });
  }
});

router.post('/:id/comments', requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required.' });
    }
    const issue = await addComment(req.params.id, {
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      text: text.trim(),
    });
    if (!issue) return res.status(404).json({ error: 'Issue not found.' });
    return res.status(201).json({ issue });
  } catch (err) {
    console.error('[Issues/Comment]', err);
    return res.status(500).json({ error: 'Failed to add comment.' });
  }
});

router.patch('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, priority, department, resolutionNote } = req.body;
    const issue = await updateIssueAdmin(
      req.params.id,
      { status, priority, department, resolutionNote },
      req.user.name
    );
    if (!issue) return res.status(404).json({ error: 'Issue not found.' });
    return res.json({ issue });
  } catch (err) {
    console.error('[Issues/AdminUpdate]', err);
    return res.status(500).json({ error: 'Failed to update issue.' });
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const ok = await deleteIssue(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Issue not found.' });
    return res.json({ deleted: true });
  } catch (err) {
    console.error('[Issues/Delete]', err);
    return res.status(500).json({ error: 'Failed to delete issue.' });
  }
});

module.exports = router;

const express = require('express');
const { listIssues } = require('../data/store');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const issues = await listIssues({});
    const total = issues.length;
    const open = issues.filter((i) => i.status === 'Open').length;
    const inProgress = issues.filter((i) => i.status === 'In Progress').length;
    const resolved = issues.filter((i) => i.status === 'Resolved').length;
    const rejected = issues.filter((i) => i.status === 'Rejected').length;
    const totalUpvotes = issues.reduce((sum, i) => sum + (i.upvotes?.length || 0), 0);

    const byCategoryMap = {};
    for (const i of issues) {
      byCategoryMap[i.category] = (byCategoryMap[i.category] || 0) + 1;
    }
    const byCategory = Object.entries(byCategoryMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return res.json({
      total,
      open,
      inProgress,
      resolved,
      rejected,
      totalUpvotes,
      resolutionRate,
      byCategory,
    });
  } catch (err) {
    console.error('[Stats]', err);
    return res.status(500).json({ error: 'Failed to compute stats.' });
  }
});

module.exports = router;

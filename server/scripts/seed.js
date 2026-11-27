require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Issue = require('../models/Issue');
const { getSeedData } = require('../data/seed');

async function runSeed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civicpin';
  try {
    await mongoose.connect(uri);
    console.log(`[Seed] Connected to MongoDB: ${uri}`);

    await User.deleteMany({});
    await Issue.deleteMany({});

    const { users, issues } = getSeedData();

    const userIdMap = {};
    for (const u of users) {
      const { _id, ...rest } = u;
      const created = await User.create(rest);
      userIdMap[_id] = String(created._id);
    }

    for (const issue of issues) {
      const { _id, ...rest } = issue;
      if (rest.reportedBy?.userId && userIdMap[rest.reportedBy.userId]) {
        rest.reportedBy.userId = userIdMap[rest.reportedBy.userId];
      }
      if (Array.isArray(rest.upvotes)) {
        rest.upvotes = rest.upvotes.map((id) => userIdMap[id] || id);
      }
      await Issue.create(rest);
    }

    console.log(`[Seed] Inserted ${users.length} users and ${issues.length} civic issues.`);
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Failed:', err.message);
    process.exit(1);
  }
}

runSeed();

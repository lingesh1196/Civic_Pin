const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const User = require('../models/User');
const Issue = require('../models/Issue');
const { getIsMongoConnected } = require('../config/db');
const { getSeedData } = require('./seed');

const DB_FILE = path.join(__dirname, 'db.json');

let memoryDb = { users: [], issues: [] };

function loadLocalDb() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      memoryDb = JSON.parse(raw);
      return;
    } catch (err) {
      console.warn('[Store] Failed to parse db.json, re-seeding:', err.message);
    }
  }
  memoryDb = getSeedData();
  saveLocalDb();
}

function saveLocalDb() {
  fs.writeFileSync(DB_FILE, JSON.stringify(memoryDb, null, 2), 'utf8');
}

async function initStore() {
  if (getIsMongoConnected()) {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const seed = getSeedData();
      for (const u of seed.users) {
        const { _id, ...rest } = u;
        await User.create(rest);
      }
      for (const issue of seed.issues) {
        const { _id, ...rest } = issue;
        await Issue.create(rest);
      }
      console.log('[Store] Seeded MongoDB with initial demo accounts and civic issues.');
    }
  } else {
    loadLocalDb();
    console.log(`[Store] Local JSON store ready (${memoryDb.users.length} users, ${memoryDb.issues.length} issues).`);
  }
}

// --- Users ---
async function findUserByEmail(email) {
  const normalized = email.toLowerCase().trim();
  if (getIsMongoConnected()) {
    return User.findOne({ email: normalized }).lean();
  }
  return memoryDb.users.find((u) => u.email === normalized) || null;
}

async function findUserById(id) {
  if (getIsMongoConnected()) {
    return User.findById(id).lean();
  }
  return memoryDb.users.find((u) => String(u._id) === String(id)) || null;
}

async function createUser(data) {
  if (getIsMongoConnected()) {
    const doc = await User.create(data);
    return doc.toObject();
  }
  const now = new Date().toISOString();
  const user = {
    _id: `user-${crypto.randomBytes(6).toString('hex')}`,
    ...data,
    email: data.email.toLowerCase().trim(),
    createdAt: now,
    updatedAt: now,
  };
  memoryDb.users.push(user);
  saveLocalDb();
  return user;
}

// --- Issues ---
async function listIssues({ status, category, search, sort } = {}) {
  let items;
  if (getIsMongoConnected()) {
    const query = {};
    if (status && status !== 'All') query.status = status;
    if (category && category !== 'All') query.category = category;
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { title: regex },
        { description: regex },
        { 'location.address': regex },
        { category: regex },
      ];
    }
    items = await Issue.find(query).lean();
  } else {
    items = [...memoryDb.issues];
    if (status && status !== 'All') {
      items = items.filter((i) => i.status === status);
    }
    if (category && category !== 'All') {
      items = items.filter((i) => i.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.location?.address || '').toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }
  }

  if (sort === 'upvotes') {
    items.sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0));
  } else if (sort === 'oldest') {
    items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else {
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return items;
}

async function findIssueById(id) {
  if (getIsMongoConnected()) {
    return Issue.findById(id).lean();
  }
  return memoryDb.issues.find((i) => String(i._id) === String(id)) || null;
}

async function createIssue(data) {
  if (getIsMongoConnected()) {
    const doc = await Issue.create(data);
    return doc.toObject();
  }
  const now = new Date().toISOString();
  const issue = {
    _id: `issue-${crypto.randomBytes(4).toString('hex')}`,
    status: 'Open',
    priority: 'Medium',
    department: 'Public Works',
    photoUrl: '',
    upvotes: [],
    resolutionNote: '',
    comments: [],
    statusHistory: [],
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  memoryDb.issues.unshift(issue);
  saveLocalDb();
  return issue;
}

async function toggleUpvote(issueId, userId) {
  const uid = String(userId);
  if (getIsMongoConnected()) {
    const issue = await Issue.findById(issueId);
    if (!issue) return null;
    const idx = issue.upvotes.indexOf(uid);
    if (idx >= 0) {
      issue.upvotes.splice(idx, 1);
    } else {
      issue.upvotes.push(uid);
    }
    await issue.save();
    return issue.toObject();
  }
  const issue = memoryDb.issues.find((i) => String(i._id) === String(issueId));
  if (!issue) return null;
  const idx = issue.upvotes.indexOf(uid);
  if (idx >= 0) {
    issue.upvotes.splice(idx, 1);
  } else {
    issue.upvotes.push(uid);
  }
  issue.updatedAt = new Date().toISOString();
  saveLocalDb();
  return issue;
}

async function addComment(issueId, comment) {
  if (getIsMongoConnected()) {
    const issue = await Issue.findById(issueId);
    if (!issue) return null;
    issue.comments.push(comment);
    await issue.save();
    return issue.toObject();
  }
  const issue = memoryDb.issues.find((i) => String(i._id) === String(issueId));
  if (!issue) return null;
  issue.comments.push({
    _id: `c-${crypto.randomBytes(4).toString('hex')}`,
    ...comment,
    createdAt: new Date().toISOString(),
  });
  issue.updatedAt = new Date().toISOString();
  saveLocalDb();
  return issue;
}

async function updateIssueAdmin(issueId, updates, adminName) {
  const { status, priority, department, resolutionNote } = updates;
  if (getIsMongoConnected()) {
    const issue = await Issue.findById(issueId);
    if (!issue) return null;
    const statusChanged = status && status !== issue.status;
    if (status) issue.status = status;
    if (priority) issue.priority = priority;
    if (department) issue.department = department;
    if (resolutionNote !== undefined) issue.resolutionNote = resolutionNote;
    if (statusChanged || resolutionNote) {
      issue.statusHistory.push({
        status: issue.status,
        note: resolutionNote || `Status updated to ${issue.status}`,
        updatedBy: adminName,
        updatedAt: new Date(),
      });
    }
    await issue.save();
    return issue.toObject();
  }
  const issue = memoryDb.issues.find((i) => String(i._id) === String(issueId));
  if (!issue) return null;
  const statusChanged = status && status !== issue.status;
  if (status) issue.status = status;
  if (priority) issue.priority = priority;
  if (department) issue.department = department;
  if (resolutionNote !== undefined) issue.resolutionNote = resolutionNote;
  if (statusChanged || resolutionNote) {
    issue.statusHistory.push({
      status: issue.status,
      note: resolutionNote || `Status updated to ${issue.status}`,
      updatedBy: adminName,
      updatedAt: new Date().toISOString(),
    });
  }
  issue.updatedAt = new Date().toISOString();
  saveLocalDb();
  return issue;
}

async function deleteIssue(issueId) {
  if (getIsMongoConnected()) {
    const res = await Issue.findByIdAndDelete(issueId);
    return Boolean(res);
  }
  const idx = memoryDb.issues.findIndex((i) => String(i._id) === String(issueId));
  if (idx === -1) return false;
  memoryDb.issues.splice(idx, 1);
  saveLocalDb();
  return true;
}

module.exports = {
  initStore,
  findUserByEmail,
  findUserById,
  createUser,
  listIssues,
  findIssueById,
  createIssue,
  toggleUpvote,
  addComment,
  updateIssueAdmin,
  deleteIssue,
};

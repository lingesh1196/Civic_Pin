const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userRole: { type: String, enum: ['citizen', 'admin'], default: 'citizen' },
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Rejected'],
    required: true,
  },
  note: { type: String, default: '' },
  updatedBy: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        'Pothole',
        'Garbage',
        'Streetlight',
        'Water Leak',
        'Drainage',
        'Traffic Signal',
        'Public Safety',
        'Other',
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Open',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    department: {
      type: String,
      default: 'Public Works',
    },
    location: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    photoUrl: { type: String, default: '' },
    reportedBy: {
      userId: { type: String, required: true },
      name: { type: String, required: true },
    },
    upvotes: [{ type: String }],
    resolutionNote: { type: String, default: '' },
    comments: [commentSchema],
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Issue', issueSchema);

const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  author: {
    type: String,
    required: [true, 'Please add an author'],
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject'],
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
  },
  tags: {
    type: [String],
    default: [],
  },
  resourceType: {
    type: String,
    required: [true, 'Please add a resource type'],
    enum: ['Textbook', 'Research Paper', 'Study Guide', 'Notes', 'Question Bank'],
  },
  fileUrl: {
    type: String, // This will be the path to the file in the local uploads folder
    required: [true, 'Please upload a file'],
  },
  externalLink: {
    type: String,
  },
  uploadedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  downloadsCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Resource', ResourceSchema);

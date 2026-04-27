const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const ErrorResponse = require('../utils/errorResponse');
const Resource = require('../models/Resource');
const { resources: mockResources } = require('../utils/sampleData');

// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
exports.getResources = async (req, res) => {
  try {
    const { category, subject, resourceType, search } = req.query;

    // Check if DB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('\x1b[33m⚠\x1b[0m DB Offline: Serving Mock Resources');
      let filtered = [...mockResources];
      
      // Basic filtering for demo
      if (category) filtered = filtered.filter(r => r.category === category);
      if (subject) filtered = filtered.filter(r => r.subject === subject);
      if (resourceType) filtered = filtered.filter(r => r.resourceType === resourceType);
      
      return res.status(200).json({
        success: true,
        count: filtered.length,
        data: filtered.map((r, i) => ({ ...r, _id: `mock_res_${i}` })),
        isDemo: true
      });
    }

    let query = {};
    if (category) query.category = category;
    if (subject) query.subject = subject;
    if (resourceType) query.resourceType = resourceType;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const resources = await Resource.find(query).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Server Error' });
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Public
exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('uploadedBy', 'name email');

    if (!resource) {
      return res.status(404).json({ success: false, error: `Resource not found with id of ${req.params.id}` });
    }

    res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Server Error' });
  }
};

// @desc    Create resource
// @route   POST /api/resources
// @access  Private/Admin
exports.createResource = async (req, res) => {
  try {
    // Add user to req.body
    req.body.uploadedBy = req.user.id;

    // Handle file upload
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a file' });
    }

    req.body.fileUrl = `/uploads/${req.file.filename}`;

    // Check if DB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('\x1b[33m⚠\x1b[0m DB Offline: Mocking Successful Upload');
      
      const newMockResource = {
        _id: `mock_res_${Date.now()}`,
        ...req.body,
        downloadsCount: 0,
        createdAt: new Date()
      };
      
      // Add to in-memory array so it instantly appears in the catalog
      mockResources.unshift(newMockResource);
      
      return res.status(201).json({
        success: true,
        data: newMockResource,
        isDemo: true
      });
    }

    const resource = await Resource.create(req.body);

    res.status(201).json({
      success: true,
      data: resource,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Server Error' });
  }
};

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private/Admin
exports.updateResource = async (req, res) => {
  try {
    let resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, error: `Resource not found with id of ${req.params.id}` });
    }

    // Make sure user is admin
    if (req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: `User ${req.user.id} is not authorized to update this resource` });
    }

    // If new file is uploaded
    if (req.file) {
      // Delete old file if exists
      const oldPath = path.join(__dirname, '..', resource.fileUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      req.body.fileUrl = `/uploads/${req.file.filename}`;
    }

    resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Server Error' });
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private/Admin
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, error: `Resource not found with id of ${req.params.id}` });
    }

    // Make sure user is admin
    if (req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: `User ${req.user.id} is not authorized to delete this resource` });
    }

    // Delete file
    const filePath = path.join(__dirname, '..', resource.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await resource.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Server Error' });
  }
};

// @desc    Download resource
// @route   GET /api/resources/:id/download
// @access  Public
exports.downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, error: `Resource not found with id of ${req.params.id}` });
    }

    const filePath = path.join(__dirname, '..', resource.fileUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'File not found on server' });
    }

    // Increment download count
    resource.downloadsCount += 1;
    await resource.save();

    res.download(filePath, `${resource.title}${path.extname(resource.fileUrl)}`);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Server Error' });
  }
};

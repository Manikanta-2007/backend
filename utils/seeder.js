const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load models
const User = require('../models/User');
const Resource = require('../models/Resource');
const Feedback = require('../models/Feedback');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

// Read JSON files
// (For simplicity, I'll define sample data directly here)
const users = [
  {
    name: 'Admin User',
    email: 'admin@edu.com',
    password: 'password123',
    role: 'admin',
    status: 'active'
  },
  {
    name: 'Student User',
    email: 'student@edu.com',
    password: 'password123',
    role: 'user',
    status: 'active'
  }
];

const resources = [
  {
    title: 'Advanced Mathematics for Engineers',
    description: 'A comprehensive guide to calculus and linear algebra for engineering students.',
    author: 'Dr. John Smith',
    subject: 'Mathematics',
    category: 'Engineering',
    tags: ['math', 'engineering', 'calculus'],
    resourceType: 'Textbook',
    fileUrl: '/uploads/sample-math.pdf',
    downloadsCount: 150
  },
  {
    title: 'Modern Physics Principles',
    description: 'An introductory course to quantum mechanics and relativity.',
    author: 'Prof. Alice Johnson',
    subject: 'Physics',
    category: 'Science',
    tags: ['physics', 'quantum', 'science'],
    resourceType: 'Textbook',
    fileUrl: '/uploads/sample-physics.pdf',
    downloadsCount: 200
  },
  {
    title: 'Data Structures and Algorithms in C++',
    description: 'Lecture notes on fundamental algorithms and data structures.',
    author: 'Tech University Staff',
    subject: 'Computer Science',
    category: 'Technology',
    tags: ['cs', 'algorithms', 'cpp'],
    resourceType: 'Notes',
    fileUrl: '/uploads/sample-cs.pdf',
    downloadsCount: 300
  }
];

// Import into DB
const importData = async () => {
  try {
    await User.deleteMany();
    await Resource.deleteMany();
    await Feedback.deleteMany();

    const createdUsers = await User.create(users);
    
    const adminId = createdUsers[0]._id;
    
    const resourcesWithAdmin = resources.map(res => ({
      ...res,
      uploadedBy: adminId
    }));
    
    await Resource.create(resourcesWithAdmin);

    console.log('Data Imported...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Resource.deleteMany();
    await Feedback.deleteMany();

    console.log('Data Destroyed...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}

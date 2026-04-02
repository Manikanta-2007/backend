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

module.exports = { users, resources };

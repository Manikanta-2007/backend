const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const { users, resources } = require('./utils/sampleData');

// Load models
const User = require('./models/User');
const Resource = require('./models/Resource');

// Load env vars
dotenv.config();

// Connect to database
const startServer = async () => {
  try {
    // 1. Connect to MongoDB first
    const { isMemory } = await connectDB();

    // 2. Automagically seed if in Memory mode
    if (isMemory) {
      console.log('\x1b[36mℹ\x1b[0m Demo Mode: Seeding in-memory database with sample data...');
      
      // Clear any (unlikely) data
      await User.deleteMany();
      await Resource.deleteMany();
      
      // Create users (passwords will be hashed by pre-save hook)
      const createdUsers = await User.create(users);
      const adminId = createdUsers[0]._id;
      
      // Create resources linked to admin
      const resourcesWithAdmin = resources.map(res => ({
        ...res,
        uploadedBy: adminId
      }));
      await Resource.create(resourcesWithAdmin);
      
      console.log('\x1b[32m✔\x1b[0m In-Memory Database Seeded Successfully.');
    }

    const app = express();

    // Body parser
    app.use(express.json());

    // Enable CORS
    app.use(cors());

    // Route files
    const auth = require('./routes/authRoutes');
    const resourcesRouter = require('./routes/resourceRoutes');
    const usersRouter = require('./routes/userRoutes');
    const feedbackRouter = require('./routes/feedbackRoutes');

    // Mount routers
    app.use('/api/auth', auth);
    app.use('/api/resources', resourcesRouter);
    app.use('/api/users', usersRouter);
    app.use('/api/feedback', feedbackRouter);

    // Static folder for uploads
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    // Home route
    app.get('/', (req, res) => {
      res.json({ message: 'Welcome to EduResource Library API (Demo Mode Active)' });
    });

    // Error handler middleware
    app.use(errorHandler);

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`\x1b[32m✔\x1b[0m Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`\x1b[35m➡\x1b[0m Ready for Launch! http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`\x1b[31m✘\x1b[0m Error starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

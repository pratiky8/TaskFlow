import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Project from './models/Project.js';
import Task from './models/Task.js';

// Load environment variables
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/taskmanager';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
    });

    const memberUser1 = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'member',
    });

    const memberUser2 = new User({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      role: 'member',
    });

    const savedAdmin = await adminUser.save();
    const savedMember1 = await memberUser1.save();
    const savedMember2 = await memberUser2.save();

    console.log('Created users');

    // Create projects
    const project1 = new Project({
      name: 'Website Redesign',
      description: 'Complete redesign of the company website',
      createdBy: savedAdmin._id,
      members: [savedAdmin._id, savedMember1._id, savedMember2._id],
    });

    const project2 = new Project({
      name: 'Mobile App Development',
      description: 'Develop a new mobile application for iOS and Android',
      createdBy: savedMember1._id,
      members: [savedMember1._id, savedMember2._id],
    });

    const project3 = new Project({
      name: 'Marketing Campaign',
      description: 'Q4 marketing campaign for product launch',
      createdBy: savedAdmin._id,
      members: [savedAdmin._id, savedMember2._id],
    });

    const savedProject1 = await project1.save();
    const savedProject2 = await project2.save();
    const savedProject3 = await project3.save();

    console.log('Created projects');

    // Create tasks
    const tasks = [
      // Website Redesign tasks
      {
        title: 'Design Homepage Mockup',
        description: 'Create a modern, responsive homepage design',
        project: savedProject1._id,
        assignedTo: savedMember1._id,
        createdBy: savedAdmin._id,
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        title: 'Implement Navigation',
        description: 'Build the main navigation component with dropdown menus',
        project: savedProject1._id,
        assignedTo: savedMember2._id,
        createdBy: savedAdmin._id,
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      },
      {
        title: 'Optimize Images',
        description: 'Compress and optimize all website images for faster loading',
        project: savedProject1._id,
        assignedTo: savedMember1._id,
        createdBy: savedAdmin._id,
        status: 'done',
        priority: 'low',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },

      // Mobile App Development tasks
      {
        title: 'Setup React Native Project',
        description: 'Initialize React Native project with necessary dependencies',
        project: savedProject2._id,
        assignedTo: savedMember1._id,
        createdBy: savedMember1._id,
        status: 'done',
        priority: 'high',
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        title: 'Design User Authentication Flow',
        description: 'Create wireframes and mockups for login/signup screens',
        project: savedProject2._id,
        assignedTo: savedMember2._id,
        createdBy: savedMember1._id,
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      },
      {
        title: 'Implement Push Notifications',
        description: 'Setup push notification service for the mobile app',
        project: savedProject2._id,
        assignedTo: savedMember1._id,
        createdBy: savedMember1._id,
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      },

      // Marketing Campaign tasks
      {
        title: 'Create Social Media Content',
        description: 'Design and schedule social media posts for the campaign',
        project: savedProject3._id,
        assignedTo: savedMember2._id,
        createdBy: savedAdmin._id,
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      },
      {
        title: 'Email Newsletter Design',
        description: 'Design responsive email templates for the campaign',
        project: savedProject3._id,
        assignedTo: savedAdmin._id,
        createdBy: savedAdmin._id,
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      },
    ];

    const savedTasks = await Task.insertMany(tasks);
    console.log(`Created ${savedTasks.length} tasks`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('User 1: john@example.com / password123');
    console.log('User 2: jane@example.com / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
const runSeed = async () => {
  await connectDB();
  await seedData();
  process.exit(0);
};

runSeed().catch(console.error);

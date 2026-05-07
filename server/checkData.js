import mongoose from 'mongoose';
import Task from './models/Task.js';
import Project from './models/Project.js';
import dotenv from 'dotenv';

dotenv.config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');
    
    const taskCount = await Task.countDocuments();
    const projectCount = await Project.countDocuments();
    
    console.log('\n=== Database Content ===');
    console.log('Tasks in database:', taskCount);
    console.log('Projects in database:', projectCount);
    
    if (taskCount === 0) {
      console.log('\n⚠️ No tasks found! Running seed script...');
      const { default: seedDatabase } = await import('./seedDatabase.js');
      await seedDatabase();
      console.log('✅ Database seeded successfully');
    } else {
      console.log('\n✅ Database has data');
      
      // Show sample tasks
      const tasks = await Task.find().limit(3).populate('project', 'name');
      console.log('\nSample tasks:');
      tasks.forEach(task => {
        console.log(`- ${task.title} (Project: ${task.project?.name || 'None'})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkData();

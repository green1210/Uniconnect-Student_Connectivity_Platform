import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'dev@student.test' },
    update: {},
    create: { email: 'dev@student.test', name: 'Dev Student', role: 'admin' }
  });
  
  await prisma.profile.upsert({
    where: { userId: admin.id },
    update: {},
    create: { 
      userId: admin.id, 
      bio: 'Developer of UniConnect', 
      university: 'Global University', 
      interests: ['coding', 'collaboration', 'innovation'] 
    }
  });
  const SEED_SAMPLE_DATA = process.env.SEED_SAMPLE_DATA === 'true';
  if (!SEED_SAMPLE_DATA) {
    console.log('ℹ️ SEED_SAMPLE_DATA not set to true. Skipping sample users, posts, threads, projects, and materials.');
    console.log('🎉 Seed complete! Admin and profile ensured.');
    return;
  }

  // Create sample students
  const students = [];
  const studentData = [
    { email: 'alice@student.test', name: 'Alice Johnson', bio: 'Computer Science major', university: 'MIT', interests: ['AI', 'Machine Learning'] },
    { email: 'bob@student.test', name: 'Bob Smith', bio: 'Business student', university: 'Harvard', interests: ['Entrepreneurship', 'Finance'] },
    { email: 'carol@student.test', name: 'Carol Williams', bio: 'Engineering student', university: 'Stanford', interests: ['Robotics', 'Design'] },
    { email: 'david@student.test', name: 'David Brown', bio: 'Medical student', university: 'Johns Hopkins', interests: ['Healthcare', 'Research'] },
  ];

  for (const data of studentData) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: { email: data.email, name: data.name, role: 'student' }
    });
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {},
      create: { 
        userId: user.id, 
        bio: data.bio, 
        university: data.university, 
        interests: data.interests 
      }
    });
    students.push(user);
  }

  console.log('✅ Created users and profiles');

  // Create sample posts
  const posts = [
    { content: 'Just finished my first project on React! So excited to share it with everyone. 🚀', authorId: students[0].id },
    { content: 'Looking for study partners for the upcoming exams. Anyone interested in forming a study group?', authorId: students[1].id },
    { content: 'Check out this amazing resource I found for learning algorithms! Super helpful! 📚', authorId: students[2].id },
    { content: 'Successfully completed my internship application. Fingers crossed! 🤞', authorId: students[3].id },
    { content: 'Does anyone have tips for balancing coursework and extracurriculars?', authorId: admin.id },
    { content: 'Just discovered UniConnect and loving the community here! Great platform for students. 💯', authorId: students[0].id },
  ];

  for (const postData of posts) {
    await prisma.post.create({ data: postData });
  }

  console.log('✅ Created sample posts');

  // Create forum threads
  const threads = [
    { 
      title: 'How to prepare for technical interviews?', 
      body: 'I have my first technical interview coming up next month. What are the best resources and strategies to prepare? Any advice would be appreciated!',
      authorId: students[0].id 
    },
    { 
      title: 'Best resources for learning React?', 
      body: 'I want to learn React for my upcoming project. What tutorials, courses, or books would you recommend for beginners?',
      authorId: students[1].id 
    },
    { 
      title: 'Study tips for finals week', 
      body: 'Finals are approaching and I need to organize my study schedule. What strategies work best for you during exam season?',
      authorId: students[2].id 
    },
    { 
      title: 'Internship opportunities for CS students', 
      body: 'Looking for summer internship opportunities in software development. Where should I be looking and how do I make my application stand out?',
      authorId: students[3].id 
    },
    { 
      title: 'How do you stay motivated during online classes?', 
      body: 'Finding it hard to stay focused during remote learning. What are your tips and tricks for maintaining motivation?',
      authorId: admin.id 
    },
  ];

  for (const threadData of threads) {
    await prisma.thread.create({ data: threadData });
  }

  console.log('✅ Created forum threads');

  // Create sample projects
  const projects = [
    { name: 'AI Study Assistant', summary: 'Machine learning powered chatbot to help students with coursework', ownerId: students[0].id },
    { name: 'Campus Event Manager', summary: 'Platform for organizing and discovering campus events', ownerId: students[1].id },
    { name: 'Student Marketplace', summary: 'Buy and sell textbooks and supplies with fellow students', ownerId: students[2].id },
    { name: 'Research Paper Organizer', summary: 'Tool for managing research papers and citations', ownerId: students[3].id },
  ];

  for (const projectData of projects) {
    await prisma.project.create({ data: projectData });
  }

  console.log('✅ Created sample projects');

  // Create sample materials
  const materials = [
    { title: 'Introduction to Algorithms - Notes', url: 'https://example.com/algo-notes', uploaderId: admin.id },
    { title: 'React Hooks Cheat Sheet', url: 'https://example.com/react-hooks', uploaderId: students[0].id },
    { title: 'Business Strategy Study Guide', url: 'https://example.com/business-guide', uploaderId: students[1].id },
    { title: 'Calculus Formula Reference', url: 'https://example.com/calculus-formulas', uploaderId: students[2].id },
    { title: 'Biology Lab Report Template', url: 'https://example.com/bio-template', uploaderId: students[3].id },
  ];

  for (const materialData of materials) {
    await prisma.material.create({ data: materialData });
  }

  console.log('✅ Created sample materials');
  console.log('🎉 Seed complete! Database is ready.');
}

main()
  .catch(e => { 
    console.error('❌ Seed failed:', e); 
    process.exit(1); 
  })
  .finally(() => prisma.$disconnect());

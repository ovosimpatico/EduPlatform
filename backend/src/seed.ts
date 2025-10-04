import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import User from './models/User';
import Course from './models/Course';
import DiagnosticQuiz from './models/DiagnosticQuiz';

dotenv.config();

async function seed() {
  try {
    await connectDatabase();
    console.log('Connected to database');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await DiagnosticQuiz.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@eduplatform.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('Created admin user');

    // Create teacher user
    const teacher = await User.create({
      name: 'John Teacher',
      email: 'teacher@eduplatform.com',
      password: 'teacher123',
      role: 'teacher',
    });
    console.log('Created teacher user');

    // Create student user
    const student = await User.create({
      name: 'Jane Student',
      email: 'student@eduplatform.com',
      password: 'student123',
      role: 'student',
    });
    console.log('Created student user');

    // Create diagnostic quiz
    const diagnosticQuiz = await DiagnosticQuiz.create({
      category: 'English',
      questions: [
        {
          question: 'What is the past tense of "go"?',
          options: ['goed', 'went', 'gone', 'goes'],
          correctAnswer: 1,
          difficulty: 'beginner',
        },
        {
          question: 'Which word is a synonym of "happy"?',
          options: ['sad', 'angry', 'joyful', 'tired'],
          correctAnswer: 2,
          difficulty: 'beginner',
        },
        {
          question: 'What is a metaphor?',
          options: [
            'A comparison using like or as',
            'A direct comparison without using like or as',
            'A sound word',
            'A repeated word',
          ],
          correctAnswer: 1,
          difficulty: 'intermediate',
        },
        {
          question: 'Which sentence uses correct grammar?',
          options: [
            'He don\'t like pizza',
            'He doesn\'t likes pizza',
            'He doesn\'t like pizza',
            'He not like pizza',
          ],
          correctAnswer: 2,
          difficulty: 'intermediate',
        },
        {
          question: 'What is the subjunctive mood used for?',
          options: [
            'Expressing facts',
            'Expressing wishes or hypotheticals',
            'Asking questions',
            'Making commands',
          ],
          correctAnswer: 1,
          difficulty: 'advanced',
        },
        {
          question: 'Identify the gerund in: "Swimming is my favorite activity"',
          options: ['is', 'my', 'Swimming', 'activity'],
          correctAnswer: 2,
          difficulty: 'advanced',
        },
      ],
    });
    console.log('Created diagnostic quiz');

    // Create sample course
    const course = await Course.create({
      title: 'English for Beginners',
      description: 'Learn the basics of English language including grammar, vocabulary, and simple conversations.',
      level: 'beginner',
      category: 'English',
      teacher: teacher._id,
      lessons: [
        {
          title: 'Introduction to English',
          content: '<h2>Welcome to English!</h2><p>In this lesson, we will learn the basics of the English language, including the alphabet, basic greetings, and common phrases.</p><h3>The English Alphabet</h3><p>The English alphabet has 26 letters: A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z</p><h3>Basic Greetings</h3><ul><li>Hello</li><li>Good morning</li><li>Good afternoon</li><li>Good evening</li><li>How are you?</li></ul>',
          order: 0,
        },
        {
          title: 'Basic Grammar',
          content: '<h2>English Grammar Basics</h2><p>Grammar is the structure of language. Let\'s learn some basic grammar rules.</p><h3>Parts of Speech</h3><ul><li><strong>Nouns:</strong> Person, place, or thing (e.g., cat, London, happiness)</li><li><strong>Verbs:</strong> Action words (e.g., run, eat, think)</li><li><strong>Adjectives:</strong> Describing words (e.g., beautiful, tall, happy)</li><li><strong>Adverbs:</strong> Describe verbs (e.g., quickly, slowly, carefully)</li></ul><h3>Simple Sentences</h3><p>A simple sentence has a subject and a verb:</p><ul><li>I am a student.</li><li>She likes pizza.</li><li>They play soccer.</li></ul>',
          order: 1,
        },
        {
          title: 'Common Vocabulary',
          content: '<h2>Building Your Vocabulary</h2><p>Let\'s learn some common English words and phrases.</p><h3>Numbers</h3><p>One, two, three, four, five, six, seven, eight, nine, ten</p><h3>Colors</h3><p>Red, blue, green, yellow, orange, purple, pink, black, white, brown</p><h3>Days of the Week</h3><p>Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday</p><h3>Common Phrases</h3><ul><li>Thank you</li><li>You\'re welcome</li><li>Excuse me</li><li>I\'m sorry</li><li>Please</li></ul>',
          order: 2,
        },
      ],
      finalAssessment: {
        questions: [
          {
            question: 'How do you greet someone in the morning?',
            options: ['Good night', 'Good morning', 'Good bye', 'See you later'],
            correctAnswer: 1,
          },
          {
            question: 'Which is a noun?',
            options: ['run', 'quickly', 'beautiful', 'dog'],
            correctAnswer: 3,
          },
          {
            question: 'What color is the sky on a clear day?',
            options: ['red', 'blue', 'green', 'yellow'],
            correctAnswer: 1,
          },
          {
            question: 'Complete: "I ___ a student"',
            options: ['is', 'am', 'are', 'be'],
            correctAnswer: 1,
          },
          {
            question: 'What day comes after Monday?',
            options: ['Sunday', 'Tuesday', 'Wednesday', 'Friday'],
            correctAnswer: 1,
          },
        ],
        passingScore: 70,
      },
    });
    console.log('Created sample course');

    console.log('\n=== Seed Complete ===');
    console.log('Admin: admin@eduplatform.com / admin123');
    console.log('Teacher: teacher@eduplatform.com / teacher123');
    console.log('Student: student@eduplatform.com / student123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Language from './models/Language.js';
import Lesson from './models/Lesson.js';
import Question from './models/Question.js';

dotenv.config();

const cLessons = [
  {
    title: "Introduction to C",
    description: "Learn the basics of C programming language",
    order: 1,
    difficulty: "beginner",
    icon: "lightbulb",
    estimatedTime: 15
  },
  {
    title: "Data Types",
    description: "Understand different data types in C",
    order: 2,
    difficulty: "beginner",
    icon: "database",
    estimatedTime: 20
  },
  {
    title: "Variables & Constants",
    description: "Master variable declaration and usage",
    order: 3,
    difficulty: "beginner",
    icon: "code",
    estimatedTime: 18
  },
  {
    title: "Operators",
    description: "Learn arithmetic, logical, and relational operators",
    order: 4,
    difficulty: "beginner",
    icon: "calculate",
    estimatedTime: 25
  },
  {
    title: "Control Statements",
    description: "Master if-else and switch-case statements",
    order: 5,
    difficulty: "intermediate",
    icon: "fork_right",
    estimatedTime: 30
  },
  {
    title: "Loops",
    description: "Understand for, while, and do-while loops",
    order: 6,
    difficulty: "intermediate",
    icon: "loop",
    estimatedTime: 30
  },
  {
    title: "Arrays",
    description: "Learn single and multi-dimensional arrays",
    order: 7,
    difficulty: "intermediate",
    icon: "grid_on",
    estimatedTime: 35
  },
  {
    title: "Strings",
    description: "Master string manipulation in C",
    order: 8,
    difficulty: "intermediate",
    icon: "text_fields",
    estimatedTime: 30
  },
  {
    title: "Functions",
    description: "Create and use functions effectively",
    order: 9,
    difficulty: "intermediate",
    icon: "functions",
    estimatedTime: 40
  },
  {
    title: "Pointers",
    description: "Understand pointer concepts and usage",
    order: 10,
    difficulty: "advanced",
    icon: "arrow_right",
    estimatedTime: 45
  },
  {
    title: "Structures",
    description: "Learn to create and use structures",
    order: 11,
    difficulty: "advanced",
    icon: "account_tree",
    estimatedTime: 35
  },
  {
    title: "File Handling",
    description: "Master file operations in C",
    order: 12,
    difficulty: "advanced",
    icon: "folder",
    estimatedTime: 40
  },
  {
    title: "Dynamic Memory",
    description: "Learn malloc, calloc, realloc, and free",
    order: 13,
    difficulty: "advanced",
    icon: "memory",
    estimatedTime: 45
  },
  {
    title: "Preprocessor Directives",
    description: "Understand #define, #include, and macros",
    order: 14,
    difficulty: "advanced",
    icon: "settings",
    estimatedTime: 30
  }
];

const getQuestionsForLesson = (lessonTitle, lessonId) => {
  const questionsMap = {
    "Introduction to C": [
      {
        question: "Who developed the C programming language?",
        options: ["James Gosling", "Dennis Ritchie", "Bjarne Stroustrup", "Guido van Rossum"],
        correctAnswer: 1,
        explanation: "Dennis Ritchie developed C at Bell Labs in 1972.",
        difficulty: "easy",
        order: 1
      }
    ]
  };

  const questions = questionsMap[lessonTitle] || [];
  return questions.map(q => ({
    ...q,
    lessonId,
    languageCode: 'c'
  }));
};

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('✅ Connected to MongoDB');

    await Language.deleteMany({});
    await Lesson.deleteMany({});
    await Question.deleteMany({});

    const cLanguage = await Language.create({
      name: 'C',
      code: 'c',
      description: 'Master the fundamentals of C programming',
      icon: 'data_object',
      color: '#00599C',
      totalLessons: cLessons.length
    });

    for (const lessonData of cLessons) {
      const lesson = await Lesson.create({
        ...lessonData,
        languageCode: 'c'
      });

      const questions = getQuestionsForLesson(lessonData.title, lesson._id);

      if (questions.length) {
        await Question.insertMany(questions);
        lesson.totalQuestions = questions.length;
        await lesson.save();
      }
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedDatabase();

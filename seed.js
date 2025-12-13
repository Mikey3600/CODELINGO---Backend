import mongoose from "mongoose";
import dotenv from "dotenv";
import Language from "./models/Language.js";
import Lesson from "./models/Lesson.js";
import Question from "./models/Question.js";

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
      },
      {
        question: "What is the file extension for C source files?",
        options: [".cpp", ".c", ".java", ".py"],
        correctAnswer: 1,
        explanation: "C source files use the .c extension.",
        difficulty: "easy",
        order: 2
      },
      {
        question: "Which header file is required for printf() function?",
        options: ["<stdlib.h>", "<string.h>", "<stdio.h>", "<math.h>"],
        correctAnswer: 2,
        explanation: "stdio.h contains declarations for input/output functions like printf().",
        difficulty: "easy",
        order: 3
      },
      {
        question: "What is the entry point of a C program?",
        options: ["start()", "main()", "begin()", "init()"],
        correctAnswer: 1,
        explanation: "Every C program starts execution from the main() function.",
        difficulty: "easy",
        order: 4
      },
      {
        question: "Which symbol is used for single-line comments in C?",
        options: ["#", "//", "/* */", "--"],
        correctAnswer: 1,
        explanation: "// is used for single-line comments in C.",
        difficulty: "easy",
        order: 5
      }
    ],
    "Data Types": [
      {
        question: "What is the size of 'int' data type on most systems?",
        options: ["1 byte", "2 bytes", "4 bytes", "8 bytes"],
        correctAnswer: 2,
        explanation: "On most modern systems, int is 4 bytes (32 bits).",
        difficulty: "medium",
        order: 1
      },
      {
        question: "Which data type is used to store decimal numbers?",
        options: ["int", "char", "float", "void"],
        correctAnswer: 2,
        explanation: "float is used to store floating-point (decimal) numbers.",
        difficulty: "easy",
        order: 2
      },
      {
        question: "What is the size of 'char' data type?",
        options: ["1 byte", "2 bytes", "4 bytes", "Depends on compiler"],
        correctAnswer: 0,
        explanation: "char data type is always 1 byte in C.",
        difficulty: "easy",
        order: 3
      },
      {
        question: "Which keyword is used for double precision floating point?",
        options: ["float", "double", "long float", "decimal"],
        correctAnswer: 1,
        explanation: "double is used for double precision floating-point numbers.",
        difficulty: "medium",
        order: 4
      },
      {
        question: "What is the range of 'unsigned char'?",
        options: ["0 to 255", "-128 to 127", "0 to 127", "-255 to 255"],
        correctAnswer: 0,
        explanation: "unsigned char ranges from 0 to 255 (8 bits, all positive).",
        difficulty: "medium",
        order: 5
      }
    ],
    "Variables & Constants": [
      {
        question: "Which keyword is used to define a constant in C?",
        options: ["constant", "const", "final", "static"],
        correctAnswer: 1,
        explanation: "const keyword is used to declare constants in C.",
        difficulty: "easy",
        order: 1
      },
      {
        question: "Can a variable name start with a digit?",
        options: ["Yes", "No", "Only if digit is 0", "Depends on compiler"],
        correctAnswer: 1,
        explanation: "Variable names cannot start with a digit in C.",
        difficulty: "easy",
        order: 2
      },
      {
        question: "What is the default value of a local variable?",
        options: ["0", "NULL", "Garbage value", "1"],
        correctAnswer: 2,
        explanation: "Local variables contain garbage values until initialized.",
        difficulty: "medium",
        order: 3
      },
      {
        question: "Which operator is used to get the address of a variable?",
        options: ["*", "&", "@", "#"],
        correctAnswer: 1,
        explanation: "& (address-of) operator returns the memory address of a variable.",
        difficulty: "medium",
        order: 4
      },
      {
        question: "Can we declare multiple variables in a single statement?",
        options: ["Yes", "No", "Only for same data type", "Only in functions"],
        correctAnswer: 2,
        explanation: "Multiple variables of the same type can be declared in one statement.",
        difficulty: "easy",
        order: 5
      }
    ],
    "Operators": [
      {
        question: "Which operator is used for modulus operation in C?",
        options: ["/", "%", "mod", "//"],
        correctAnswer: 1,
        explanation: "The % operator returns the remainder of division.",
        difficulty: "easy",
        order: 1
      },
      {
        question: "What is the result of 5 / 2 in C?",
        options: ["2.5", "2", "3", "2.0"],
        correctAnswer: 1,
        explanation: "Integer division truncates the decimal part, so 5/2 = 2.",
        difficulty: "medium",
        order: 2
      },
      {
        question: "Which operator has the highest precedence?",
        options: ["*", "+", "()", "="],
        correctAnswer: 2,
        explanation: "Parentheses () have the highest precedence in C.",
        difficulty: "medium",
        order: 3
      },
      {
        question: "What does the ++ operator do?",
        options: ["Adds 2", "Increments by 1", "Multiplies by 2", "Doubles the value"],
        correctAnswer: 1,
        explanation: "The ++ operator increments a variable by 1.",
        difficulty: "easy",
        order: 4
      },
      {
        question: "Which is a logical AND operator in C?",
        options: ["&", "&&", "AND", "|"],
        correctAnswer: 1,
        explanation: "&& is the logical AND operator in C.",
        difficulty: "easy",
        order: 5
      }
    ],
    "Control Statements": [
      {
        question: "Which statement is used to exit from a switch case?",
        options: ["exit", "break", "return", "continue"],
        correctAnswer: 1,
        explanation: "break statement is used to exit from a switch case.",
        difficulty: "easy",
        order: 1
      },
      {
        question: "What is the output of: if(0) printf(\"True\"); else printf(\"False\");",
        options: ["True", "False", "Error", "Nothing"],
        correctAnswer: 1,
        explanation: "In C, 0 is considered false, so the else block executes.",
        difficulty: "medium",
        order: 2
      },
      {
        question: "Which keyword is used for multi-way branching?",
        options: ["if", "switch", "case", "select"],
        correctAnswer: 1,
        explanation: "switch statement is used for multi-way branching in C.",
        difficulty: "easy",
        order: 3
      },
      {
        question: "Can we use float in switch case?",
        options: ["Yes", "No", "Only in C99", "Depends on compiler"],
        correctAnswer: 1,
        explanation: "Switch cases only work with integer and character types, not float.",
        difficulty: "medium",
        order: 4
      },
      {
        question: "What is the ternary operator in C?",
        options: ["? :", "if-else", "switch", "&&"],
        correctAnswer: 0,
        explanation: "?: is the ternary operator (condition ? true : false).",
        difficulty: "medium",
        order: 5
      }
    ],
    "Loops": [
      {
        question: "Which loop is guaranteed to execute at least once?",
        options: ["for", "while", "do-while", "foreach"],
        correctAnswer: 2,
        explanation: "do-while loop checks condition after execution, so it runs at least once.",
        difficulty: "medium",
        order: 1
      },
      {
        question: "What does the continue statement do in a loop?",
        options: ["Exits the loop", "Skips current iteration", "Restarts loop", "Pauses loop"],
        correctAnswer: 1,
        explanation: "continue skips the rest of the current iteration and moves to the next.",
        difficulty: "easy",
        order: 2
      },
      {
        question: "What is an infinite loop?",
        options: ["Loop without condition", "Loop that never ends", "Loop with break", "Nested loop"],
        correctAnswer: 1,
        explanation: "An infinite loop is one that never terminates (e.g., while(1)).",
        difficulty: "easy",
        order: 3
      },
      {
        question: "Which loop is best when iterations are known beforehand?",
        options: ["while", "do-while", "for", "goto"],
        correctAnswer: 2,
        explanation: "for loop is ideal when the number of iterations is known in advance.",
        difficulty: "medium",
        order: 4
      },
      {
        question: "What is the output of: for(;;) { printf(\"Hi\"); break; }",
        options: ["Infinite Hi", "Hi once", "Error", "Nothing"],
        correctAnswer: 1,
        explanation: "The loop runs once and then break exits it, printing Hi once.",
        difficulty: "hard",
        order: 5
      }
    ],
    "Arrays": [
      {
        question: "What is the index of the first element in an array?",
        options: ["1", "0", "-1", "Depends on declaration"],
        correctAnswer: 1,
        explanation: "Array indexing in C starts from 0.",
        difficulty: "easy",
        order: 1
      },
      {
        question: "How do you declare an array of 5 integers?",
        options: ["int arr[5];", "int arr(5);", "array int[5];", "int [5]arr;"],
        correctAnswer: 0,
        explanation: "Syntax: datatype arrayName[size];",
        difficulty: "easy",
        order: 2
      },
      {
        question: "Can array size be changed after declaration?",
        options: ["Yes", "No", "Only with realloc", "Depends on type"],
        correctAnswer: 1,
        explanation: "Array size is fixed at compile time and cannot be changed.",
        difficulty: "medium",
        order: 3
      },
      {
        question: "What is a 2D array?",
        options: ["Array of arrays", "Two arrays", "Array with 2 elements", "Pointer array"],
        correctAnswer: 0,
        explanation: "A 2D array is an array of arrays, forming a matrix structure.",
        difficulty: "medium",
        order: 4
      },
      {
        question: "How is an array passed to a function?",
        options: ["By value", "By reference", "By copy", "Cannot be passed"],
        correctAnswer: 1,
        explanation: "Arrays are passed by reference (pointer to first element).",
        difficulty: "hard",
        order: 5
      }
    ],
    "Strings": [
      {
        question: "How is a string terminated in C?",
        options: ["EOF", "\\0", "NULL", "END"],
        correctAnswer: 1,
        explanation: "Strings in C are null-terminated with \\0 character.",
        difficulty: "easy",
        order: 1
      },
      {
        question: "Which function is used to copy one string to another?",
        options: ["strcopy()", "strcpy()", "stringcopy()", "strdup()"],
        correctAnswer: 1,
        explanation: "strcpy() copies the content of one string to another.",
        difficulty: "easy",
        order: 2
      },
      {
        question: "What does strlen() return?",
        options: ["Size in bytes", "Length excluding \\0", "Length including \\0", "Number of words"],
        correctAnswer: 1,
        explanation: "strlen() returns the number of characters excluding null terminator.",
        difficulty: "medium",
        order: 3
      },
      {
        question: "Which function compares two strings?",
        options: ["strcomp()", "strcmp()", "streq()", "compare()"],
        correctAnswer: 1,
        explanation: "strcmp() compares two strings lexicographically.",
        difficulty: "easy",
        order: 4
      },
      {
        question: "What is the difference between char str[] and char *str?",
        options: ["No difference", "Array vs Pointer", "Size vs Reference", "Stack vs Heap"],
        correctAnswer: 1,
        explanation: "char str[] is an array, char *str is a pointer to a string.",
        difficulty: "hard",
        order: 5
      }
    ],
    "Functions": [
      {
        question: "What is the return type of main() function?",
        options: ["void", "int", "char", "float"],
        correctAnswer: 1,
        explanation: "main() function returns int (0 for success, non-zero for error).",
        difficulty: "easy",
        order: 1
      },
      {
        question: "What is a function prototype?",
        options: ["Function definition", "Function declaration", "Function call", "Function body"],
        correctAnswer: 1,
        explanation: "A prototype declares a function before its definition.",
        difficulty: "medium",
        order: 2
      },
      {
        question: "Can a function return multiple values in C?",
        options: ["Yes", "No", "Using pointers", "Using arrays"],
        correctAnswer: 2,
        explanation: "Functions return one value, but can modify multiple values using pointers.",
        difficulty: "medium",
        order: 3
      },
      {
        question: "What is recursion?",
        options: ["Loop", "Function calling itself", "Nested function", "Inline function"],
        correctAnswer: 1,
        explanation: "Recursion is when a function calls itself.",
        difficulty: "easy",
        order: 4
      },
      {
        question: "What is the scope of a local variable?",
        options: ["Entire program", "Within function", "Within file", "Global"],
        correctAnswer: 1,
        explanation: "Local variables are only accessible within the function they're declared in.",
        difficulty: "medium",
        order: 5
      }
    ],
    "Pointers": [
      {
        question: "What is a pointer?",
        options: ["Data type", "Variable storing address", "Function", "Array"],
        correctAnswer: 1,
        explanation: "A pointer is a variable that stores memory address of another variable.",
        difficulty: "easy",
        order: 1
      },
      {
        question: "Which operator is used to get value at pointer address?",
        options: ["&", "*", "->", "::"],
        correctAnswer: 1,
        explanation: "* (dereference) operator gets the value at the pointer's address.",
        difficulty: "easy",
        order: 2
      },
      {
        question: "What is a NULL pointer?",
        options: ["Uninitialized pointer", "Pointer to 0 address", "Invalid pointer", "Pointer to NULL"],
        correctAnswer: 1,
        explanation: "NULL pointer points to memory address 0 (invalid location).",
        difficulty: "medium",
        order: 3
      },
      {
        question: "What is pointer arithmetic?",
        options: ["Math with pointers", "Adding/subtracting from pointer", "Pointer multiplication", "Pointer comparison"],
        correctAnswer: 1,
        explanation: "Pointer arithmetic involves incrementing/decrementing pointer addresses.",
        difficulty: "medium",
        order: 4
      },
      {
        question: "What is a dangling pointer?",
        options: ["NULL pointer", "Pointer to freed memory", "Uninitialized pointer", "Void pointer"],
        correctAnswer: 1,
        explanation: "Dangling pointer points to memory that has been freed/deallocated.",
        difficulty: "hard",
        order: 5
      }
    ],
    "Structures": [
      {
        question: "What keyword is used to define a structure?",
        options: ["structure", "struct", "class", "type"],
        correctAnswer: 1,
        explanation: "struct keyword is used to define structures in C.",
        difficulty: "easy",
        order: 1
      },
      {
        question: "How do you access structure members?",
        options: ["->", ".", "::", "[]"],
        correctAnswer: 1,
        explanation: "The . (dot) operator accesses structure members.",
        difficulty: "easy",
        order: 2
      },
      {
        question: "Can a structure contain another structure?",
        options: ["Yes", "No", "Only pointers", "Depends on size"],
        correctAnswer: 0,
        explanation: "Structures can contain other structures (nested structures).",
        difficulty: "medium",
        order: 3
      },
      {
        question: "What is the difference between struct and union?",
        options: ["No difference", "Memory allocation", "Syntax", "Scope"],
        correctAnswer: 1,
        explanation: "Struct allocates separate memory for each member, union shares memory.",
        difficulty: "hard",
        order: 4
      },
      {
        question: "How to access member of structure pointer?",
        options: [".", "->", "*", "&"],
        correctAnswer: 1,
        explanation: "-> operator accesses members through a structure pointer.",
        difficulty: "medium",
        order: 5
      }
    ],
    "File Handling": [
      {
        question: "Which function opens a file?",
        options: ["open()", "fopen()", "file_open()", "openfile()"],
        correctAnswer: 1,
        explanation: "fopen() is used to open files in C.",
        difficulty: "easy",
        order: 1
      },
      {
        question: "Which mode is used to open a file for reading?",
        options: ["w", "r", "a", "rb"],
        correctAnswer: 1,
        explanation: "\"r\" mode opens file for reading.",
        difficulty: "easy",
        order: 2
      },
      {
        question: "What does fclose() do?",
        options: ["Deletes file", "Closes file", "Reads file", "Writes file"],
        correctAnswer: 1,
        explanation: "fclose() closes an open file and flushes buffers.",
        difficulty: "easy",
        order: 3
      },
      {
        question: "Which function reads a character from file?",
        options: ["fgetc()", "getc()", "fread()", "Both A and B"],
        correctAnswer: 3,
        explanation: "Both fgetc() and getc() read a single character from file.",
        difficulty: "medium",
        order: 4
      },
      {
        question: "What is EOF?",
        options: ["End of File", "Error in File", "Exit on Fail", "End of Function"],
        correctAnswer: 0,
        explanation: "EOF stands for End of File, returned when file reading is complete.",
        difficulty: "easy",
        order: 5
      }
    ],
    "Dynamic Memory": [
      {
        question: "Which function allocates memory dynamically?",
        options: ["alloc()", "malloc()", "memory()", "new()"],
        correctAnswer: 1,
        explanation: "malloc() allocates memory dynamically at runtime.",
        difficulty: "easy",
        order: 1
      },
      {
        question: "What does free() function do?",
        options: ["Allocates memory", "Deallocates memory", "Clears memory", "Copies memory"],
        correctAnswer: 1,
        explanation: "free() deallocates previously allocated dynamic memory.",
        difficulty: "easy",
        order: 2
      },
      {
        question: "What is the difference between malloc and calloc?",
        options: ["No difference", "calloc initializes to 0", "malloc is faster", "calloc is deprecated"],
        correctAnswer: 1,
        explanation: "calloc initializes allocated memory to zero, malloc doesn't.",
        difficulty: "medium",
        order: 3
      },
      {
        question: "Which function resizes allocated memory?",
        options: ["resize()", "realloc()", "remalloc()", "changesize()"],
        correctAnswer: 1,
        explanation: "realloc() changes the size of previously allocated memory.",
        difficulty: "medium",
        order: 4
      },
      {
        question: "What happens if malloc fails?",
        options: ["Returns 0", "Returns NULL", "Program crashes", "Returns -1"],
        correctAnswer: 1,
        explanation: "malloc returns NULL if memory allocation fails.",
        difficulty: "medium",
        order: 5
      }
    ],
    "Preprocessor Directives": [
      {
        question: "Which symbol starts a preprocessor directive?",
        options: ["@", "#", "$", "%"],
        correctAnswer: 1,
        explanation: "# symbol is used to start preprocessor directives.",
        difficulty: "easy",
        order: 1
      },
      {
        question: "What does #include do?",
        options: ["Defines macro", "Includes file", "Includes library", "Compiles code"],
        correctAnswer: 1,
        explanation: "#include includes the content of another file.",
        difficulty: "easy",
        order: 2
      },
      {
        question: "What is #define used for?",
        options: ["Declare variable", "Define macro", "Include file", "Define function"],
        correctAnswer: 1,
        explanation: "#define is used to define macros (constants or code snippets).",
        difficulty: "easy",
        order: 3
      },
      {
        question: "What does #ifdef check?",
        options: ["If defined", "If error", "If file exists", "If function defined"],
        correctAnswer: 0,
        explanation: "#ifdef checks if a macro is defined.",
        difficulty: "medium",
        order: 4
      },
      {
        question: "When are preprocessor directives processed?",
        options: ["At runtime", "Before compilation", "After compilation", "During linking"],
        correctAnswer: 1,
        explanation: "Preprocessor directives are processed before actual compilation.",
        difficulty: "medium",
        order: 5
      }
    ]
  };

  const questions = questionsMap[lessonTitle] || [];
  return questions.map(q => ({
    ...q,
    lessonId: lessonId,
    languageCode: "c"
  }));
};

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ Connected to MongoDB");

    await Language.deleteMany({});
    await Lesson.deleteMany({});
    await Question.deleteMany({});

    console.log("🗑️  Cleared existing data");

    const cLanguage = await Language.create({
      name: "C",
      code: "c",
      description: "Master the fundamentals of C programming",
      icon: "data_object",
      color: "#00599C",
      totalLessons: cLessons.length
    });

    console.log("✅ Created C language");

    for (const lessonData of cLessons) {
      const lesson = await Lesson.create({
        ...lessonData,
        languageCode: "c"
      });

      const questions = getQuestionsForLesson(lessonData.title, lesson._id);
      
      if (questions.length > 0) {
        await Question.insertMany(questions);
        lesson.totalQuestions = questions.length;
        await lesson.save();
      }

      console.log(`✅ Created lesson: ${lesson.title} with ${questions.length} questions`);
    }

    console.log("🎉 Database seeded successfully!");
    console.log(`📊 Total: ${cLessons.length} lessons, ${cLessons.length * 5} questions`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();

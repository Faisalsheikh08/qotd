import connectDB from "./connection.js";
import Exam from "./models/Exam.js";
import User from "./models/User.js";
import Question from "./models/Question.js";
import QuestionOfTheDay from "./models/QuestionOfTheDay.js";
import UserProgress from "./models/UserProgress.js";
import Submission from "./models/Submission.js";
import Activity from "./models/Activity.js";

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await Exam.deleteMany({});
  await User.deleteMany({});
  await Question.deleteMany({});
  await QuestionOfTheDay.deleteMany({});
  await UserProgress.deleteMany({});
  await Submission.deleteMany({});
  await Activity.deleteMany({});

  // Drop the fullName index to avoid conflicts (uncomment if you want to remove the unique constraint)
  /*
  try {
    await Exam.collection.dropIndex("fullName_1");
    console.log("Dropped fullName_1 index");
  } catch (err) {
    console.log("No fullName_1 index to drop or error dropping index:", err.message);
  }
  */

  // Seed Admin User
  const adminUser = await User.create({
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    googleProfile: {
      sub: "admin-google-id",
      email_verified: true,
    },
    phoneNoVerified: true,
  });
  console.log("Admin user seeded:", adminUser);

  // Seed Regular Users
  const users = await User.insertMany([
    {
      name: "Test User 1",
      email: "test1@example.com",
      role: "user",
      googleProfile: { sub: "test1-google-id", email_verified: true },
      phoneNoVerified: true,
    },
    {
      name: "Test User 2",
      email: "test2@example.com",
      role: "user",
      googleProfile: { sub: "test2-google-id", email_verified: true },
      phoneNoVerified: true,
    },
  ]);
  console.log("Regular users seeded:", users);

  // Seed Exams (Bihar Teaching Exams) with explicit fullName
  const exams = [
    {
      exam: "BPSC",
      category: "TRE",
      subject: "Primary",
      class: "(1-5)",
      fullName: "BPSC TRE Primary (1-5)", // Explicitly set
      description:
        "Bihar Public Service Commission Teacher Recruitment Exam for Primary Teachers",
      createdBy: adminUser._id,
    },
    {
      exam: "BPSC",
      category: "TRE",
      subject: "Secondary",
      class: "(6-8)",
      fullName: "BPSC TRE Secondary (6-8)", // Explicitly set
      description:
        "Bihar Public Service Commission Teacher Recruitment Exam for Secondary Teachers",
      createdBy: adminUser._id,
    },
    {
      exam: "Bihar STET",
      category: "PGT",
      subject: "General",
      class: "(9-10)",
      fullName: "Bihar STET PGT General (9-10)", // Explicitly set
      description:
        "Bihar State Teacher Eligibility Test for Post Graduate Teachers",
      createdBy: adminUser._id,
    },
    {
      exam: "Bihar TET",
      category: "PRT",
      subject: "Primary",
      class: "(1-5)",
      fullName: "Bihar TET PRT Primary (1-5)", // Explicitly set
      description: "Bihar Teacher Eligibility Test for Primary Teachers",
      createdBy: adminUser._id,
    },
    {
      exam: "Bihar TET",
      category: "TGT",
      subject: "Upper Primary",
      class: "(6-8)",
      fullName: "Bihar TET TGT Upper Primary (6-8)", // Explicitly set
      description:
        "Bihar Teacher Eligibility Test for Trained Graduate Teachers",
      createdBy: adminUser._id,
    },
  ];

  // Insert exams one by one to ensure pre-save hook runs
  const createdExams = [];
  for (const exam of exams) {
    const newExam = await Exam.create(exam);
    createdExams.push(newExam);
  }
  console.log("Exams seeded:", createdExams);

  // Seed Sample Questions (for multiple exams)
  const sampleQuestions = [
    {
      englishText: "What is the capital of Bihar?",
      hindiText: "बिहार की राजधानी क्या है?",
      type: "descriptive",
      englishCorrectAnswer: "Patna is the capital of Bihar.",
      hindiCorrectAnswer: "पटना बिहार की राजधानी है।",
      aiCorrect: [
        {
          englishText: "The capital city of Bihar is Patna.",
          hindiText: "बिहार की राजधानी शहर पटना है।",
          confidence: 95,
        },
      ],
      englishExplanation: "Patna is historically known as Pataliputra.",
      hindiExplanation:
        "पटना ऐतिहासिक रूप से पाटलिपुत्र के नाम से जाना जाता है।",
      difficulty: "Easy",
      category: "General Knowledge",
      examType: createdExams[0]._id, // BPSC TRE Primary
      points: 10,
      createdBy: adminUser._id,
    },
    {
      englishText: "Explain the education system in Bihar.",
      hindiText: "बिहार में शिक्षा प्रणाली की व्यख्‍या करें।",
      type: "descriptive",
      englishCorrectAnswer:
        "The education system in Bihar includes primary, secondary, and higher education managed by the state government.",
      hindiCorrectAnswer:
        "बिहार में शिक्षा प्रणाली में प्राथमिक, माध्यमिक और उच्च शिक्षा शामिल है जो राज्य सरकार द्वारा प्रबंधित की जाती है।",
      aiCorrect: [
        {
          englishText:
            "Bihar's education system comprises schools and universities under state control.",
          hindiText:
            "बिहार की शिक्षा प्रणाली में स्कूल और विश्वविद्यालय राज्य नियंत्रण के तहत शामिल हैं।",
          confidence: 90,
        },
      ],
      englishExplanation:
        "It faces challenges like infrastructure but is improving.",
      hindiExplanation:
        "यह बुनियादी ढांचे जैसी चुनौतियों का सामना करता है लेकिन सुधार हो रहा है।",
      difficulty: "Medium",
      category: "Education",
      examType: createdExams[0]._id,
      points: 15,
      createdBy: adminUser._id,
    },
    {
      englishText: "What is the main river of Bihar?",
      hindiText: "बिहार की मुख्य नदी क्या है?",
      type: "descriptive",
      englishCorrectAnswer: "The main river of Bihar is the Ganges.",
      hindiCorrectAnswer: "बिहार की मुख्य नदी गंगा है।",
      aiCorrect: [
        {
          englishText: "The Ganges is the primary river flowing through Bihar.",
          hindiText: "गंगा बिहार से बहने वाली मुख्य नदी है।",
          confidence: 95,
        },
      ],
      englishExplanation: "The Ganges supports agriculture in Bihar.",
      hindiExplanation: "गंगा बिहार में कृषि को समर्थन देती है।",
      difficulty: "Easy",
      category: "Geography",
      examType: createdExams[1]._id, // BPSC TRE Secondary
      points: 10,
      createdBy: adminUser._id,
    },
    {
      englishText: "Discuss the history of Patna.",
      hindiText: "पटना के इतिहास पर चर्चा करें।",
      type: "descriptive",
      englishCorrectAnswer:
        "Patna, formerly Pataliputra, has a rich history dating back to the Maurya Empire.",
      hindiCorrectAnswer:
        "पटना, जो पहले पाटलिपुत्र था, का इतिहास मौर्य साम्राज्य से जुड़ा है।",
      aiCorrect: [
        {
          englishText:
            "Patna was a major center during the Maurya and Gupta empires.",
          hindiText:
            "पटना मौर्य और गुप्त साम्राज्यों के दौरान एक प्रमुख केंद्र था।",
          confidence: 90,
        },
      ],
      englishExplanation: "It was a political hub in ancient India.",
      hindiExplanation: "यह प्राचीन भारत में एक राजनीतिक केंद्र था।",
      difficulty: "Hard",
      category: "History",
      examType: createdExams[2]._id, // Bihar STET PGT
      points: 20,
      createdBy: adminUser._id,
    },
  ];

  const createdQuestions = await Question.insertMany(sampleQuestions);
  console.log("Questions seeded:", createdQuestions);

  // Seed QuestionOfTheDay (for today, multiple exams)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const qotds = await Promise.all([
    QuestionOfTheDay.create({
      date: today,
      examType: createdExams[0]._id,
      question: createdQuestions[0]._id,
      assignedBy: adminUser._id,
    }),
    QuestionOfTheDay.create({
      date: today,
      examType: createdExams[1]._id,
      question: createdQuestions[2]._id,
      assignedBy: adminUser._id,
    }),
    QuestionOfTheDay.create({
      date: today,
      examType: createdExams[2]._id,
      question: createdQuestions[3]._id,
      assignedBy: adminUser._id,
    }),
  ]);
  console.log("QOTDs seeded:", qotds);

  // Seed UserProgress for all users
  const userProgresses = await Promise.all([
    UserProgress.create({
      user: users[0]._id,
      examType: createdExams[0]._id,
    }),
    UserProgress.create({
      user: users[1]._id,
      examType: createdExams[1]._id,
    }),
  ]);
  console.log("UserProgress seeded:", userProgresses);

  // Seed Submissions for multiple users (removed qotd to match schema)
  const submissions = await Promise.all([
    Submission.create({
      user: users[0]._id,
      question: createdQuestions[0]._id,
      userAnswer: {
        english: "Patna",
        hindi: "पटना",
        languagePreference: "english",
      },
      isCorrect: true,
      confidence: 95,
      feedback: {
        english: "Correct answer.",
        hindi: "सही उत्तर।",
      },
      pointsEarned: 10,
      timeTaken: 120,
    }),
    Submission.create({
      user: users[1]._id,
      question: createdQuestions[2]._id,
      userAnswer: {
        english: "The Ganges",
        hindi: "गंगा",
        languagePreference: "english",
      },
      isCorrect: true,
      confidence: 90,
      feedback: {
        english: "Correct answer.",
        hindi: "सही उत्तर।",
      },
      pointsEarned: 10,
      timeTaken: 150,
    }),
  ]);
  console.log("Submissions seeded:", submissions);

  // Seed Activities for multiple users
  const activities = await Activity.insertMany([
    {
      userId: users[0]._id,
      date: new Date(), // Current timestamp
      count: 1,
    },
    {
      userId: users[0]._id,
      date: new Date(), // Current timestamp
      count: 1,
    },
    {
      userId: users[1]._id,
      date: new Date(), // Current timestamp
      count: 1,
    },
  ]);
  console.log("Activities seeded:", activities);

  // Update stats (simulate)
  await userProgresses[0].updateAfterSubmission(submissions[0], today);
  await userProgresses[1].updateAfterSubmission(submissions[1], today);
  await qotds[0].incrementSubmissions(true);
  await qotds[1].incrementSubmissions(true);
  await createdQuestions[0].incrementSubmissions(true);
  await createdQuestions[2].incrementSubmissions(true);

  // Update exam totalQuestions manually (since questions were added)
  createdExams[0].totalQuestions = 2; // Questions 0 and 1
  await createdExams[0].save();
  createdExams[1].totalQuestions = 1; // Question 2
  await createdExams[1].save();
  createdExams[2].totalQuestions = 1; // Question 3
  await createdExams[2].save();

  console.log("Database seeded successfully!");
  process.exit(0);
};

seedData().catch((error) => {
  console.error("Seeding error:", error);
  process.exit(1);
});

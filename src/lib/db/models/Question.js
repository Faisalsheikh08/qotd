// src/lib/db/models/Question.js
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    // English Question text/content
    title: {
      type: String,
      // require: true,
    },
    englishText: {
      type: String,
      required: [true, "English question text is required"],
      trim: true,
      minlength: [10, "English question must be at least 10 characters"],
    },
    scheduledDate: {
      type: Date,
      // required: true,
    },
    // Hindi Question text/content
    hindiText: {
      type: String,
      required: [true, "Hindi question text is required"],
      trim: true,
      minlength: [10, "Hindi question must be at least 10 characters"],
    },
    // Type fixed as descriptive
    type: {
      type: String,
      enum: ["descriptive"],
      default: "descriptive",
      required: true,
    },
    // English Correct answer (descriptive, up to 250 words)
    englishCorrectAnswer: {
      type: String,
      required: [true, "English correct answer is required"],
      trim: true,
      maxlength: [
        1250,
        "English correct answer must not exceed 250 words (approx 1250 characters)",
      ],
      select: false, // Don't expose in queries by default
    },
    // Hindi Correct answer (descriptive, up to 250 words)
    hindiCorrectAnswer: {
      type: String,
      required: [true, "Hindi correct answer is required"],
      trim: true,
      maxlength: [
        1250,
        "Hindi correct answer must not exceed 250 words (approx 1250 characters)",
      ],
      select: false, // Don't expose in queries by default
    },
    // AI-generated correct answers (array for multiple acceptable answers in both languages)
    aiCorrect: [
      {
        englishText: {
          type: String,
          required: true,
          trim: true,
          maxlength: [
            1250,
            "English AI correct answer must not exceed 250 words (approx 1250 characters)",
          ],
        },
        hindiText: {
          type: String,
          required: true,
          trim: true,
          maxlength: [
            1250,
            "Hindi AI correct answer must not exceed 250 words (approx 1250 characters)",
          ],
        },
        confidence: {
          type: Number,
          min: 0,
          max: 100,
          default: 90, // Default confidence level
        },
      },
    ],
    // English Explanation for the answer
    englishExplanation: {
      type: String,
      trim: true,
    },
    // Hindi Explanation for the answer
    hindiExplanation: {
      type: String,
      trim: true,
    },
    // Difficulty level
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Uncategorised"],
      default: "uncategorised",
    },
    // Subject/category
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      index: true,
    },
    // Linked exam type
    examType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: [true, "Exam type is required"],
      index: true,
    },
    // Points value for correct answer
    points: {
      type: Number,
      default: 10,
      min: 1,
    },
    // Time limit in seconds (optional)
    timeLimit: {
      type: Number,
      default: null,
    },
    // Source or reference (optional)
    source: {
      type: String,
      trim: true,
    },
    // Tags for filtering
    tags: [String],
    // Admin who created the question
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Flag if question is active/approved
    isActive: {
      type: Boolean,
      default: true,
    },
    // Total submissions for this question
    totalSubmissions: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
questionSchema.index({ examType: 1, subject: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ createdBy: 1 });

// Virtual for success rate
questionSchema.virtual("successRate").get(function () {
  if (this.totalSubmissions === 0) return 0;
  return ((this.correctSubmissions / this.totalSubmissions) * 100).toFixed(2);
});

// Method to increment submission stats
questionSchema.methods.incrementSubmissions = async function (isCorrect) {
  this.totalSubmissions += 1;
  if (isCorrect) {
    this.correctSubmissions += 1;
  }
  return this.save();
};

// Static method to get random question for exam type (for QOTD assignment)
questionSchema.statics.getRandomQuestion = async function (
  examType,
  excludeIds = []
) {
  const count = await this.countDocuments({
    examType,
    isActive: true,
    _id: { $nin: excludeIds },
  });
  const random = Math.floor(Math.random() * count);
  return this.findOne({ examType, isActive: true, _id: { $nin: excludeIds } })
    .skip(random)
    .select("-englishCorrectAnswer -hindiCorrectAnswer -aICorrect"); // Don't include correct answers
};

// Static method to search questions
questionSchema.statics.search = async function (
  query,
  examType,
  page = 1,
  limit = 20
) {
  const skip = (page - 1) * limit;
  const searchQuery = {
    examType,
    isActive: true,
    $or: [
      { englishText: { $regex: query, $options: "i" } },
      { hindiText: { $regex: query, $options: "i" } },
      { subject: { $regex: query, $options: "i" } },
      { tags: { $regex: query, $options: "i" } },
    ],
  };
  return this.find(searchQuery)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .select("-englishCorrectAnswer -hindiCorrectAnswer -aICorrect");
};

const Question =
  mongoose.models.Question || mongoose.model("Question", questionSchema);

export default Question;

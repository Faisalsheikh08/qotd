// src/lib/db/models/QuestionOfTheDay.js
import mongoose from "mongoose";

const questionOfTheDaySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: false, // Not unique because we have multiple exam types
    },
    examType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: [true, "Exam type is required"],
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    // Total submissions for this QOTD
    totalSubmissions: {
      type: Number,
      default: 0,
    },
    correctSubmissions: {
      type: Number,
      default: 0,
    },
    // Flag to mark if this QOTD is active
    isActive: {
      type: Boolean,
      default: true,
    },
    // Admin who assigned this question
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one question per exam type per day
questionOfTheDaySchema.index({ date: 1, examType: 1 }, { unique: true });
questionOfTheDaySchema.index({ isActive: 1, date: -1 });

// Static method to get today's question for a specific exam type
questionOfTheDaySchema.statics.getTodaysQuestion = async function (examType) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return this.findOne({
    examType,
    date: { $gte: today, $lt: tomorrow },
    isActive: true,
  }).populate("question");
};

// Static method to check if QOTD exists for today
questionOfTheDaySchema.statics.existsForToday = async function (examType) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const count = await this.countDocuments({
    examType,
    date: { $gte: today, $lt: tomorrow },
    isActive: true,
  });

  return count > 0;
};

// Method to increment submission stats
questionOfTheDaySchema.methods.incrementSubmissions = async function (
  isCorrect
) {
  this.totalSubmissions += 1;
  if (isCorrect) {
    this.correctSubmissions += 1;
  }
  return this.save();
};

// Virtual for success rate
questionOfTheDaySchema.virtual("successRate").get(function () {
  if (this.totalSubmissions === 0) return 0;
  return ((this.correctSubmissions / this.totalSubmissions) * 100).toFixed(2);
});

const QuestionOfTheDay =
  mongoose.models.QuestionOfTheDay ||
  mongoose.model("QuestionOfTheDay", questionOfTheDaySchema);

export default QuestionOfTheDay;

// src/lib/db/models/UserProgress.js
import mongoose from "mongoose";

const userProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    examType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    // Overall statistics
    totalQuestions: {
      type: Number,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    incorrectAnswers: {
      type: Number,
      default: 0,
    },
    totalPoints: {
      type: Number,
      default: 0,
      index: true, // For leaderboard queries
    },
    // Current streak (consecutive days)
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastSubmissionDate: {
      type: Date,
    },
    // Subject-wise performance
    subjectPerformance: [
      {
        subject: String,
        attempted: { type: Number, default: 0 },
        correct: { type: Number, default: 0 },
      },
    ],
    // Monthly statistics
    monthlyStats: [
      {
        month: String, // Format: 'YYYY-MM'
        attempted: { type: Number, default: 0 },
        correct: { type: Number, default: 0 },
        points: { type: Number, default: 0 },
      },
    ],
    // Achievements
    achievements: [
      {
        name: String,
        description: String,
        earnedAt: Date,
        icon: String,
      },
    ],
    // Rank in leaderboard
    rank: {
      type: Number,
      default: null,
    },
    // Last rank update
    lastRankUpdate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for leaderboard
userProgressSchema.index({ totalPoints: -1, correctAnswers: -1 });
userProgressSchema.index({ examType: 1, totalPoints: -1 });

// Virtual for accuracy percentage
userProgressSchema.virtual("accuracy").get(function () {
  if (this.totalQuestions === 0) return 0;
  return ((this.correctAnswers / this.totalQuestions) * 100).toFixed(2);
});

// Method to update progress after submission
userProgressSchema.methods.updateAfterSubmission = async function (
  submission,
  questionDate
) {
  // Update total questions and answers
  this.totalQuestions += 1;

  if (submission.isCorrect) {
    this.correctAnswers += 1;
    this.totalPoints += submission.pointsEarned;
  } else {
    this.incorrectAnswers += 1;
  }

  // Update streak
  this.updateStreak(questionDate);

  // Update subject performance
  const question = await mongoose
    .model("Question")
    .findById(submission.question);
  if (question) {
    const subjectIndex = this.subjectPerformance.findIndex(
      (s) => s.subject === question.subject
    );

    if (subjectIndex >= 0) {
      this.subjectPerformance[subjectIndex].attempted += 1;
      if (submission.isCorrect) {
        this.subjectPerformance[subjectIndex].correct += 1;
      }
    } else {
      this.subjectPerformance.push({
        subject: question.subject,
        attempted: 1,
        correct: submission.isCorrect ? 1 : 0,
      });
    }
  }

  // Update monthly stats
  const monthKey = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  const monthIndex = this.monthlyStats.findIndex((m) => m.month === monthKey);

  if (monthIndex >= 0) {
    this.monthlyStats[monthIndex].attempted += 1;
    if (submission.isCorrect) {
      this.monthlyStats[monthIndex].correct += 1;
      this.monthlyStats[monthIndex].points += submission.pointsEarned;
    }
  } else {
    this.monthlyStats.push({
      month: monthKey,
      attempted: 1,
      correct: submission.isCorrect ? 1 : 0,
      points: submission.isCorrect ? submission.pointsEarned : 0,
    });
  }

  this.lastSubmissionDate = questionDate;

  return this.save();
};

// Method to update streak
userProgressSchema.methods.updateStreak = function (submissionDate) {
  if (!this.lastSubmissionDate) {
    this.currentStreak = 1;
    this.longestStreak = 1;
    return;
  }

  const lastDate = new Date(this.lastSubmissionDate);
  lastDate.setHours(0, 0, 0, 0);

  const currentDate = new Date(submissionDate);
  currentDate.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

  if (daysDiff === 1) {
    // Consecutive day
    this.currentStreak += 1;
    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
    }
  } else if (daysDiff > 1) {
    // Streak broken
    this.currentStreak = 1;
  }
  // If daysDiff === 0, same day submission, don't change streak
};

// Static method to get leaderboard
userProgressSchema.statics.getLeaderboard = async function (
  examType = null,
  limit = 100
) {
  const query = examType ? { examType } : {};

  return this.find(query)
    .sort({ totalPoints: -1, correctAnswers: -1, updatedAt: 1 })
    .limit(limit)
    .populate("user", "name email mobile")
    .lean();
};

// Static method to update all ranks
userProgressSchema.statics.updateAllRanks = async function (examType = null) {
  const query = examType ? { examType } : {};

  const allProgress = await this.find(query).sort({
    totalPoints: -1,
    correctAnswers: -1,
    updatedAt: 1,
  });

  const bulkOps = allProgress.map((progress, index) => ({
    updateOne: {
      filter: { _id: progress._id },
      update: {
        rank: index + 1,
        lastRankUpdate: new Date(),
      },
    },
  }));

  if (bulkOps.length > 0) {
    await this.bulkWrite(bulkOps);
  }

  return bulkOps.length;
};

const UserProgress =
  mongoose.models.UserProgress ||
  mongoose.model("UserProgress", userProgressSchema);

export default UserProgress;

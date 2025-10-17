import User from "../db/models/User";
import Question from "../db/models/Question";
import Submission from "../db/models/Submission";
import QuestionOfTheDay from "../db/models/QuestionOfTheDay";
import connectDB from "../db/connection";

export const analyticsService = {
  async getOverview() {
    await connectDB();

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      lastLoginDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });
    const totalQuestions = await Question.countDocuments({ isActive: true });
    const totalSubmissions = await Submission.countDocuments();

    return {
      totalUsers,
      activeUsers,
      totalQuestions,
      totalSubmissions,
    };
  },

  async getSubmissionStats(startDate, endDate) {
    await connectDB();

    const query = {};
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const stats = await Submission.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          correctSubmissions: { $sum: { $cond: ["$isCorrect", 1, 0] } },
          avgConfidence: { $avg: "$confidence" },
          avgTimeTaken: { $avg: "$timeTaken" },
          totalPoints: { $sum: "$pointsEarned" },
        },
      },
    ]);

    return stats[0] || {};
  },

  async getDailyStats(days = 30) {
    await connectDB();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyStats = await Submission.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          submissions: { $sum: 1 },
          correct: { $sum: { $cond: ["$isCorrect", 1, 0] } },
          avgConfidence: { $avg: "$confidence" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return dailyStats;
  },

  async getCategoryPerformance() {
    await connectDB();

    const categoryStats = await Submission.aggregate([
      {
        $lookup: {
          from: "questions",
          localField: "question",
          foreignField: "_id",
          as: "questionData",
        },
      },
      { $unwind: "$questionData" },
      {
        $group: {
          _id: "$questionData.category",
          total: { $sum: 1 },
          correct: { $sum: { $cond: ["$isCorrect", 1, 0] } },
          avgConfidence: { $avg: "$confidence" },
        },
      },
      {
        $project: {
          category: "$_id",
          total: 1,
          correct: 1,
          accuracy: {
            $multiply: [{ $divide: ["$correct", "$total"] }, 100],
          },
          avgConfidence: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    return categoryStats;
  },

  async getTopPerformers(limit = 10) {
    await connectDB();

    return await User.getLeaderboard(limit, "alltime");
  },

  async getRecentActivity(limit = 20) {
    await connectDB();

    return await Submission.find()
      .populate("user", "name email image")
      .populate("question", "englishText hindiText subject")
      .sort({ createdAt: -1 })
      .limit(limit);
  },

  async getUserAnalytics(userId) {
    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const submissions = await Submission.find({ user: userId });

    const stats = {
      totalSubmissions: submissions.length,
      correctAnswers: submissions.filter((s) => s.isCorrect).length,
      avgConfidence:
        submissions.reduce((sum, s) => sum + (s.confidence || 0), 0) /
        submissions.length,
      totalPoints: submissions.reduce((sum, s) => sum + s.pointsEarned, 0),
      avgTimeTaken:
        submissions.reduce((sum, s) => sum + (s.timeTaken || 0), 0) /
        submissions.length,
    };

    return { user, stats };
  },
};

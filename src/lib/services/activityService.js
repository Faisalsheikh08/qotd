// src/lib/services/activityService.js
import Activity from "@/lib/db/models/Activity";
import User from "@/lib/db/models/User";
import connectDB from "@/lib/db/connection";

export const activityService = {
  // Log user activity
  async logActivity(userId, activityType, metadata = {}, ipAddress = null) {
    try {
      await connectDB();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if activity already logged today
      const existingActivity = await Activity.findOne({
        userId,
        activityType,
        date: today,
      });

      if (existingActivity) {
        existingActivity.count += 1;
        if (metadata) {
          existingActivity.metadata = {
            ...existingActivity.metadata,
            ...metadata,
          };
        }
        await existingActivity.save();
        return existingActivity;
      }

      // Create new activity record
      const activity = await Activity.create({
        userId,
        activityType,
        date: today,
        count: 1,
        metadata: {
          ...metadata,
          ipAddress,
        },
        isFirstOfDay: true,
      });

      return activity;
    } catch (error) {
      console.error("Error logging activity:", error);
      throw error;
    }
  },

  // Log submission activity
  async logSubmission(
    userId,
    questionId,
    examType,
    submissionId,
    duration,
    ipAddress
  ) {
    try {
      await connectDB();

      return await this.logActivity(userId, "submission", {
        questionId,
        examType,
        submissionId,
        duration,
        ipAddress,
      });
    } catch (error) {
      console.error("Error logging submission:", error);
      throw error;
    }
  },

  // Log login activity
  async logLogin(userId, ipAddress, userAgent) {
    try {
      await connectDB();

      return await this.logActivity(userId, "login", {
        ipAddress,
        userAgent,
      });
    } catch (error) {
      console.error("Error logging login:", error);
      throw error;
    }
  },

  // Log logout activity
  async logLogout(userId, ipAddress) {
    try {
      await connectDB();

      return await this.logActivity(userId, "logout", {
        ipAddress,
      });
    } catch (error) {
      console.error("Error logging logout:", error);
      throw error;
    }
  },

  // Log profile update
  async logProfileUpdate(userId, ipAddress) {
    try {
      await connectDB();

      return await this.logActivity(userId, "profile_update", {
        ipAddress,
      });
    } catch (error) {
      console.error("Error logging profile update:", error);
      throw error;
    }
  },

  // Log exam selection
  async logExamSelection(userId, examType, ipAddress) {
    try {
      await connectDB();

      return await this.logActivity(userId, "exam_selection", {
        examType,
        ipAddress,
      });
    } catch (error) {
      console.error("Error logging exam selection:", error);
      throw error;
    }
  },

  // Log question view
  async logQuestionView(userId, questionId, examType, ipAddress) {
    try {
      await connectDB();

      return await this.logActivity(userId, "question_view", {
        questionId,
        examType,
        ipAddress,
      });
    } catch (error) {
      console.error("Error logging question view:", error);
      throw error;
    }
  },

  // Get user activity summary
  async getUserActivitySummary(userId) {
    try {
      await connectDB();

      const summary = await Activity.getUserActivitySummary(userId);
      const streak = await Activity.getUserStreak(userId);

      return {
        ...summary[0],
        streak,
      };
    } catch (error) {
      console.error("Error getting activity summary:", error);
      throw error;
    }
  },

  // Get user activity calendar
  async getUserActivityCalendar(userId, startDate, endDate) {
    try {
      await connectDB();

      return await Activity.getActivityCalendar(userId, startDate, endDate);
    } catch (error) {
      console.error("Error getting activity calendar:", error);
      throw error;
    }
  },

  // Get user streak
  async getUserStreak(userId) {
    try {
      await connectDB();

      return await Activity.getUserStreak(userId);
    } catch (error) {
      console.error("Error getting user streak:", error);
      throw error;
    }
  },

  // Get user activities
  async getUserActivities(userId, page = 1, limit = 20) {
    try {
      await connectDB();

      const skip = (page - 1) * limit;
      const activities = await Activity.find({ userId })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Activity.countDocuments({ userId });

      return {
        activities,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error getting user activities:", error);
      throw error;
    }
  },

  // Get activity by type
  async getActivitiesByType(userId, activityType, startDate, endDate) {
    try {
      await connectDB();

      return await Activity.find({
        userId,
        activityType,
        date: { $gte: startDate, $lte: endDate },
      }).sort({ date: -1 });
    } catch (error) {
      console.error("Error getting activities by type:", error);
      throw error;
    }
  },

  // Calculate daily stats
  async getDailyStats(userId, date = new Date()) {
    try {
      await connectDB();

      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const activities = await Activity.find({
        userId,
        date: { $gte: startDate, $lte: endDate },
      });

      const stats = {
        date: startDate.toISOString().split("T")[0],
        totalActivities: activities.length,
        submissions: activities.filter((a) => a.activityType === "submission")
          .length,
        logins: activities.filter((a) => a.activityType === "login").length,
        questionViews: activities.filter(
          (a) => a.activityType === "question_view"
        ).length,
        examSelections: activities.filter(
          (a) => a.activityType === "exam_selection"
        ).length,
      };

      return stats;
    } catch (error) {
      console.error("Error calculating daily stats:", error);
      throw error;
    }
  },

  // Get weekly stats
  async getWeeklyStats(userId) {
    try {
      await connectDB();

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);

      const activities = await Activity.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            submissions: {
              $sum: {
                $cond: [{ $eq: ["$activityType", "submission"] }, "$count", 0],
              },
            },
            views: {
              $sum: {
                $cond: [
                  { $eq: ["$activityType", "question_view"] },
                  "$count",
                  0,
                ],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return activities;
    } catch (error) {
      console.error("Error getting weekly stats:", error);
      throw error;
    }
  },

  // Get monthly stats
  async getMonthlyStats(userId, year, month) {
    try {
      await connectDB();

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const activities = await Activity.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            submissions: {
              $sum: {
                $cond: [{ $eq: ["$activityType", "submission"] }, "$count", 0],
              },
            },
            totalActivities: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const summary = {
        year,
        month,
        totalDaysActive: activities.length,
        totalSubmissions: activities.reduce((sum, a) => sum + a.submissions, 0),
      };

      return {
        summary,
        dailyBreakdown: activities,
      };
    } catch (error) {
      console.error("Error getting monthly stats:", error);
      throw error;
    }
  },
};

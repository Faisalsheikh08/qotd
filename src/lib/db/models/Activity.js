// import mongoose from "mongoose";

// const activitySchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: [true, "User ID is required"],
//       index: true,
//     },
//     date: {
//       type: Date, // Stores the timestamp of the activity
//       required: [true, "Activity date is required"],
//     },
//     count: {
//       type: Number,
//       required: [true, "Count is required"],
//       min: [1, "Count cannot be negative"],
//       default: 1,
//     },
//   },
//   {
//     timestamps: true, // Adds createdAt and updatedAt
//   }
// );

// // Indexes for efficient querying
// activitySchema.index({ userId: 1, createdAt: -1 });

// // Method to increment count
// activitySchema.methods.incrementCount = async function () {
//   this.count += 1;
//   return this.save();
// };

// // Static method to find activities by user
// activitySchema.statics.findByUser = async function (
//   userId,
//   page = 1,
//   limit = 20
// ) {
//   const skip = (page - 1) * limit;
//   return this.find({ userId }).skip(skip).limit(limit).sort({ createdAt: -1 });
// };

// // Static method to get activity summary for a user
// activitySchema.statics.getUserActivitySummary = async function (userId) {
//   return this.aggregate([
//     { $match: { userId: new mongoose.Types.ObjectId(userId) } },
//     {
//       $group: {
//         _id: "$userId",
//         totalActivities: { $sum: 1 },
//         totalCount: { $sum: "$count" },
//         lastActivity: { $max: "$createdAt" },
//       },
//     },
//   ]);
// };

// const Activity =
//   mongoose.models.Activity || mongoose.model("Activity", activitySchema);

// export default Activity;

import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    activityType: {
      type: String,
      enum: [
        "login",
        "logout",
        "submission",
        "question_view",
        "profile_update",
        "exam_selection",
        "course_enrollment",
      ],
      default: "submission",
      index: true,
    },
    date: {
      type: Date,
      required: [true, "Activity date is required"],
      index: true,
    },
    count: {
      type: Number,
      required: [true, "Count is required"],
      min: [1, "Count cannot be negative"],
      default: 1,
    },
    // Metadata for detailed tracking
    metadata: {
      questionId: mongoose.Schema.Types.ObjectId,
      examType: String,
      submissionId: mongoose.Schema.Types.ObjectId,
      duration: Number, // in seconds
      ipAddress: String,
      userAgent: String,
      deviceType: {
        type: String,
        enum: ["mobile", "tablet", "desktop"],
      },
    },
    // Track activity streak
    streak: {
      type: Number,
      default: 1,
    },
    isFirstOfDay: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ userId: 1, date: 1, activityType: 1 });
activitySchema.index({ date: -1 }); // For daily reports
activitySchema.index({ "metadata.examType": 1, date: -1 });

// Method to increment count
activitySchema.methods.incrementCount = async function () {
  this.count += 1;
  return this.save();
};

// Static method to find activities by user
activitySchema.statics.findByUser = async function (
  userId,
  page = 1,
  limit = 20
) {
  const skip = (page - 1) * limit;
  return this.find({ userId }).skip(skip).limit(limit).sort({ createdAt: -1 });
};

// Static method to get activity summary for a user
activitySchema.statics.getUserActivitySummary = async function (userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: "$userId",
        totalActivities: { $sum: 1 },
        totalCount: { $sum: "$count" },
        lastActivity: { $max: "$createdAt" },
        byType: {
          $push: {
            type: "$activityType",
            count: "$count",
          },
        },
      },
    },
  ]);
};

// Static method to log activity
activitySchema.statics.logActivity = async function (userId, activityData) {
  const { activityType, metadata, date = new Date() } = activityData;

  const today = new Date(date);
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Check if activity already logged today
  const existingActivity = await this.findOne({
    userId,
    activityType,
    date: { $gte: today, $lt: tomorrow },
  });

  if (existingActivity) {
    existingActivity.count += 1;
    if (metadata) {
      existingActivity.metadata = { ...existingActivity.metadata, ...metadata };
    }
    return await existingActivity.save();
  }

  // Create new activity record
  return await this.create({
    userId,
    activityType,
    date: today,
    count: 1,
    metadata,
    isFirstOfDay: true,
  });
};

// Static method to get daily activity calendar data
activitySchema.statics.getActivityCalendar = async function (
  userId,
  startDate,
  endDate
) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        totalActivities: { $sum: 1 },
        totalCount: { $sum: "$count" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

// Static method to get user streak
activitySchema.statics.getUserStreak = async function (userId) {
  const activities = await this.find({ userId, activityType: "submission" })
    .sort({ date: -1 })
    .limit(100);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  let previousDate = null;

  for (const activity of activities) {
    const activityDate = new Date(activity.date);
    activityDate.setHours(0, 0, 0, 0);

    if (previousDate === null) {
      tempStreak = 1;
    } else {
      const daysDiff = Math.floor(
        (previousDate - activityDate) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        tempStreak += 1;
      } else if (daysDiff > 1) {
        break; // Streak broken
      }
    }

    currentStreak = tempStreak;
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    previousDate = activityDate;
  }

  return { currentStreak, longestStreak };
};

const Activity =
  mongoose.models.Activity || mongoose.model("Activity", activitySchema);

export default Activity;

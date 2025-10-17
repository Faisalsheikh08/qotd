import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    date: {
      type: Date, // Stores the timestamp of the activity
      required: [true, "Activity date is required"],
    },
    count: {
      type: Number,
      required: [true, "Count is required"],
      min: [1, "Count cannot be negative"],
      default: 1,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Indexes for efficient querying
activitySchema.index({ userId: 1, createdAt: -1 });

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
      },
    },
  ]);
};

const Activity =
  mongoose.models.Activity || mongoose.model("Activity", activitySchema);

export default Activity;

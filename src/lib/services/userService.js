import User from "../db/models/User";
import UserProgress from "../db/models/UserProgress";
import connectDB from "../db/connection";

export const userService = {
  async createUser(data) {
    await connectDB();

    const existingUser = await User.findByEmail(data.email);
    if (existingUser) {
      return existingUser;
    }

    return await User.create(data);
  },

  async getUserById(userId) {
    await connectDB();

    return await User.findById(userId).select("-password -adminNotes");
  },

  async getUserByEmail(email) {
    await connectDB();

    return await User.findByEmail(email);
  },

  async updateUser(userId, updateData) {
    await connectDB();

    return await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -adminNotes");
  },

  async getUserProgress(userId, examType = null) {
    await connectDB();

    const query = { user: userId };
    if (examType) query.examType = examType;

    return await UserProgress.find(query).populate(
      "examType",
      "fullName exam category"
    );
  },

  async getUserStats(userId) {
    await connectDB();

    const user = await User.findById(userId).select(
      "stats achievements badges"
    );

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },

  async getLeaderboard(examType = null, limit = 100) {
    await connectDB();

    return await UserProgress.getLeaderboard(examType, limit);
  },

  async updateLastLogin(userId) {
    await connectDB();

    return await User.findByIdAndUpdate(userId, {
      lastLoginDate: new Date(),
      $inc: { loginCount: 1 },
    });
  },

  async banUser(userId, reason, duration) {
    await connectDB();

    const bannedUntil = duration
      ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
      : null;

    return await User.findByIdAndUpdate(userId, {
      isBanned: true,
      banReason: reason,
      bannedUntil,
    });
  },

  async unbanUser(userId) {
    await connectDB();

    return await User.findByIdAndUpdate(userId, {
      isBanned: false,
      banReason: null,
      bannedUntil: null,
    });
  },
};

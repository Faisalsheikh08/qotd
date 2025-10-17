import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // ==================== BASIC INFO (FROM GOOGLE AUTH) ====================
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
      // Comes from: profile.name or profile.given_name + profile.family_name
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
      index: true,
      // Comes from: profile.email
    },

    image: {
      type: String,
      default: null,
    },
    emailVerified: {
      type: Date,
      default: null,
      // Comes from: profile.email_verified (Google returns boolean, convert to Date if true)
    },
    phoneNoVerified: {
      type: Boolean,
      default: false,
    },
    // Additional Google Auth Data
    googleProfile: {
      sub: String, // Google's unique user ID
      given_name: String, // First name
      family_name: String, // Last name
      picture: String, // Profile picture URL
      locale: String, // User's locale (e.g., 'en')
      email_verified: Boolean, // Whether email is verified by Google
    },
    password: {
      type: String,
      select: false, // Don't include password in queries by default
    },
    // ==================== USER ROLE & STATUS ====================
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isBanned: {
      type: Boolean,
      default: false,
    },

    banReason: {
      type: String,
      default: null,
    },

    bannedUntil: {
      type: Date,
      default: null,
    },

    location: {
      type: String,
      default: "",
    },

    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
    },

    stats: {
      // Submission Stats
      correctAnswers: {
        type: Number,
        default: 0,
        min: 0,
      },

      incorrectAnswers: {
        type: Number,
        default: 0,
        min: 0,
      },

      // Scoring Stats
      totalScore: {
        type: Number,
        default: 0,
        min: 0,
      },

      averageScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      highestScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      // Streak Stats
      currentStreak: {
        type: Number,
        default: 0,
        min: 0,
      },

      longestStreak: {
        type: Number,
        default: 0,
        min: 0,
      },

      categoryStats: {
        type: Map,
        of: {
          attempted: { type: Number, default: 0 },
          correct: { type: Number, default: 0 },
          totalScore: { type: Number, default: 0 },
        },
        default: new Map(),
      },
    },

    // ==================== ACHIEVEMENTS & BADGES ====================
    achievements: [
      {
        id: String,
        name: String,
        description: String,
        icon: String,
        earnedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    badges: [
      {
        type: {
          type: String,
          enum: [
            "first_submission",
            "week_streak",
            "month_streak",
            "perfect_score",
            "speed_demon",
            "night_owl",
            "early_bird",
            "category_master",
            "hundred_submissions",
            "top_performer",
          ],
        },
        earnedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ==================== ACTIVITY TRACKING ====================
    lastSubmissionDate: {
      type: Date,
      default: null,
    },

    lastLoginDate: {
      type: Date,
      default: Date.now,
    },

    loginCount: {
      type: Number,
      default: 0,
    },

    // Track submission history by date
    submissionCalendar: {
      type: Map,
      of: {
        submitted: Boolean,
        score: Number,
        isCorrect: Boolean,
      },
      default: new Map(),
    },

    // ==================== RANKING & LEADERBOARD ====================
    ranking: {
      all: {
        type: Number,
        default: null,
      },
      weekly: {
        type: Number,
        default: null,
      },
      monthly: {
        type: Number,
        default: null,
      },
    },

    points: {
      type: Number,
      default: 0,
      min: 0,
    },

    level: {
      type: Number,
      default: 1,
      min: 1,
    },

    // ==================== SUBSCRIPTION & PREMIUM ====================
    subscription: {
      plan: {
        type: String,
        enum: ["free", "pro"],
        default: "free",
      },
      startDate: {
        type: Date,
        default: null,
      },
      endDate: {
        type: Date,
        default: null,
      },
      isActive: {
        type: Boolean,
        default: false,
      },
    },

    // ---- Course Enrollment ---- [incomplete]
    enrollments: [
      {
        courseId: {
          type: String,
        },
        courseName: {
          type: String,
        },
        enrolledDate: {
          type: Date,
          default: Date.now,
        },
        completionDate: {
          type: Date,
          default: null,
        },
      },
    ],

    // ---- Control flag ----
    accessType: {
      type: String,
      enum: ["subscription", "course"],
      default: "subscription",
    },

    // ==================== ADMIN & MODERATION ====================
    adminNotes: {
      type: String,
      default: "",
      select: false, // Only visible to admins
    },

    moderationFlags: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    collection: "users",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================
// Create indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ "stats.totalScore": -1 }); // For leaderboard
userSchema.index({ "stats.currentStreak": -1 }); // For streak rankings
userSchema.index({ provider: 1, providerId: 1 }); // For OAuth lookups
userSchema.index({ isActive: 1, isBanned: 1 }); // For filtering active users
userSchema.index({ points: -1 }); // For points-based ranking

// ==================== VIRTUALS ====================
// Accuracy percentage
userSchema.virtual("stats.accuracy").get(function () {
  if (this.stats.totalSubmissions === 0) return 0;
  return (
    (this.stats.correctAnswers / this.stats.totalSubmissions) *
    100
  ).toFixed(2);
});

// Level progress (points needed for next level)
userSchema.virtual("levelProgress").get(function () {
  const pointsPerLevel = 1000;
  const currentLevelPoints = (this.level - 1) * pointsPerLevel;
  const nextLevelPoints = this.level * pointsPerLevel;
  const progress = ((this.points - currentLevelPoints) / pointsPerLevel) * 100;

  return {
    current: this.points - currentLevelPoints,
    required: pointsPerLevel,
    percentage: Math.min(progress, 100).toFixed(2),
  };
});

// Full name with email fallback
userSchema.virtual("displayName").get(function () {
  return this.name || this.email.split("@")[0];
});

// ==================== METHODS ====================
// Update user stats after submission
userSchema.methods.updateStats = async function (submission) {
  this.stats.totalSubmissions += 1;

  if (submission.isCorrect) {
    this.stats.correctAnswers += 1;
  } else {
    this.stats.incorrectAnswers += 1;
  }

  this.stats.totalScore += submission.score;
  this.stats.averageScore = this.stats.totalScore / this.stats.totalSubmissions;

  if (submission.score > this.stats.highestScore) {
    this.stats.highestScore = submission.score;
  }

  // Update time stats
  if (submission.timeTaken) {
    this.stats.totalTimeTaken += submission.timeTaken;
    this.stats.averageTimeTaken =
      this.stats.totalTimeTaken / this.stats.totalSubmissions;
  }

  this.lastSubmissionDate = new Date();

  return this.save();
};

// Update streak
userSchema.methods.updateStreak = async function (isSubmittedToday) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (!this.lastSubmissionDate) {
    this.stats.currentStreak = 1;
  } else {
    const lastSubmission = new Date(this.lastSubmissionDate);
    lastSubmission.setHours(0, 0, 0, 0);

    if (lastSubmission.getTime() === yesterday.getTime()) {
      // Submitted yesterday, increment streak
      this.stats.currentStreak += 1;
    } else if (lastSubmission.getTime() !== today.getTime()) {
      // Missed a day, reset streak
      this.stats.currentStreak = 1;
    }
  }

  if (this.stats.currentStreak > this.stats.longestStreak) {
    this.stats.longestStreak = this.stats.currentStreak;
  }

  return this.save();
};

// Award badge
userSchema.methods.awardBadge = async function (badgeType) {
  const existingBadge = this.badges.find((b) => b.type === badgeType);

  if (!existingBadge) {
    this.badges.push({
      type: badgeType,
      earnedAt: new Date(),
    });
    return this.save();
  }

  return this;
};

// Calculate level based on points
userSchema.methods.calculateLevel = function () {
  const pointsPerLevel = 1000;
  const newLevel = Math.floor(this.points / pointsPerLevel) + 1;

  if (newLevel > this.level) {
    this.level = newLevel;
    return true; // Level up occurred
  }

  return false;
};

// Add points and check for level up
userSchema.methods.addPoints = async function (points) {
  this.points += points;
  const leveledUp = this.calculateLevel();
  await this.save();

  return { leveledUp, newLevel: this.level };
};

// Check if user is premium
userSchema.methods.isPremium = function () {
  if (!this.subscription.isActive) return false;
  if (!this.subscription.endDate) return false;
  return new Date() < this.subscription.endDate;
};

// ==================== STATICS ====================
// Get user by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Get user by OAuth provider
userSchema.statics.findByProvider = function (provider, providerId) {
  return this.findOne({ provider, providerId });
};

// Get leaderboard
userSchema.statics.getLeaderboard = function (
  limit = 10,
  timeframe = "alltime"
) {
  const sortField = timeframe === "alltime" ? "stats.totalScore" : "points";

  return this.find({ isActive: true, isBanned: false })
    .select("name email image stats points level")
    .sort({ [sortField]: -1 })
    .limit(limit);
};

// Get users by streak
userSchema.statics.getTopStreaks = function (limit = 10) {
  return this.find({ isActive: true, isBanned: false })
    .select("name email image stats.currentStreak stats.longestStreak")
    .sort({ "stats.currentStreak": -1 })
    .limit(limit);
};

// ==================== MIDDLEWARE ====================
// Pre-save middleware
userSchema.pre("save", function (next) {
  // Update accuracy for each difficulty
  if (this.stats.difficultyStats) {
    ["easy", "medium", "hard"].forEach((diff) => {
      const stat = this.stats.difficultyStats[diff];
      if (stat.attempted > 0) {
        stat.accuracy = ((stat.correct / stat.attempted) * 100).toFixed(2);
      }
    });
  }

  next();
});

// Pre-save: Update last login on each save if needed
userSchema.pre("save", function (next) {
  if (this.isModified("lastLoginDate")) {
    this.loginCount += 1;
  }
  next();
});

// ==================== EXPORT ====================
export default mongoose.models.User || mongoose.model("User", userSchema);

// ==================== USAGE EXAMPLES ====================

/*
// 1. Create a new user (OAuth)
const newUser = await User.create({
  name: "John Doe",
  email: "john@example.com",
  provider: "google",
  providerId: "google-id-123",
  image: "https://avatar.url"
});

// 2. Update stats after submission
await user.updateStats({
  isCorrect: true,
  score: 95,
  timeTaken: 120
});

// 3. Update streak
await user.updateStreak();

// 4. Award badge
await user.awardBadge('first_submission');

// 5. Add points
const result = await user.addPoints(50);
if (result.leveledUp) {
  console.log(`Level up! Now level ${result.newLevel}`);
}

// 6. Get leaderboard
const topUsers = await User.getLeaderboard(10, 'alltime');

// 7. Check premium status
if (user.isPremium()) {
  // Grant premium features
}

// 8. Find by email
const user = await User.findByEmail('john@example.com');

// 9. Get user with stats
const userWithStats = await User.findById(userId)
  .select('name email stats badges achievements');

// 10. Get top streaks
const topStreaks = await User.getTopStreaks(10);
*/

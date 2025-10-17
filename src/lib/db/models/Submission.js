// src/lib/db/models/Submission.js
import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    // User who submitted
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    // The question submitted
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: [true, "Question is required"],
      index: true,
    },
    // The QOTD instance (for daily tracking)
    // qotd: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "QuestionOfTheDay",
    //   required: [true, "QOTD reference is required"],
    //   index: true,
    // },
    // User's answer (descriptive, up to 250 words, with language preference)
    userAnswer: {
      english: {
        type: String,
        trim: true,
        maxlength: [
          1250,
          "English user answer must not exceed 250 words (approx 1250 characters)",
        ],
      },
      hindi: {
        type: String,
        trim: true,
        maxlength: [
          1250,
          "Hindi user answer must not exceed 250 words (approx 1250 characters)",
        ],
      },
      languagePreference: {
        type: String,
        enum: ["english", "hindi"],
        required: [true, "Language preference is required"],
      },
    },
    // Whether the answer is correct (determined by Grok API)
    isCorrect: {
      type: Boolean,
      required: true,
    },
    // Confidence score from AI verification (0-100)
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    // Feedback from AI verification in both languages
    feedback: {
      english: {
        type: String,
        trim: true,
      },
      hindi: {
        type: String,
        trim: true,
      },
    },
    // Points earned (based on question points, possibly modified by AI assessment)
    pointsEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Time taken in seconds
    timeTaken: {
      type: Number,
      default: null,
      min: 0,
    },
    // Device info (optional, for analytics)
    device: {
      type: String,
      trim: true,
    },
    // IP address (for security)
    ipAddress: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate submissions (one per user per QOTD)
submissionSchema.index({ user: 1, qotd: 1 }, { unique: true });

// Indexes for queries
submissionSchema.index({ isCorrect: 1 });
submissionSchema.index({ createdAt: -1 });

// Pre-save hook to calculate points
submissionSchema.pre("save", function (next) {
  if (this.isCorrect) {
    // Points earned can be adjusted based on AI confidence or length match
    // For simplicity, default to question points (set in service layer)
    if (!this.pointsEarned) {
      this.pointsEarned = 10; // Default, override in service
    }
  } else {
    this.pointsEarned = 0;
  }
  next();
});

// Method to verify answer (placeholder, actual in service with Grok API)
submissionSchema.methods.verifyAnswer = function (correctAnswers) {
  // Placeholder: Descriptive answers need AI (Grok) for verification against aICorrect array in both languages
  // This will be handled in service layer comparing with aICorrect array
  return false; // Default to false, service will override
};

// Static method to get user submissions for a period
submissionSchema.statics.getUserSubmissions = async function (
  userId,
  startDate,
  endDate
) {
  return this.find({
    user: userId,
    createdAt: { $gte: startDate, $lte: endDate },
  })
    .sort({ createdAt: -1 })
    .populate("question", "englishText hindiText subject difficulty");
};

// Static method to check if user has submitted for today's QOTD
submissionSchema.statics.hasSubmittedToday = async function (userId, qotdId) {
  const count = await this.countDocuments({ user: userId, qotd: qotdId });
  return count > 0;
};

const Submission =
  mongoose.models.Submission || mongoose.model("Submission", submissionSchema);

export default Submission;

import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    // Full name: e.g., "KVS PRT Primary (1-5)" - Auto-generated

    // Exam name: e.g., "KVS", "BPSC", "CTET"
    exam: {
      type: String,
      required: [true, "Exam name is required"],
      trim: true,
      index: true,
    },
    // Category: e.g., "PRT", "TGT", "TRE", "PGT"
    category: {
      type: String,
      // required: [true, "Category is required"],
      trim: true,
    },
    // Subject: e.g., "Primary", "Secondary", "General"
    subject: {
      type: String,
      // required: [true, "Subject is required"],
      trim: true,
    },
    // Class range: e.g., "(1-5)", "(6-10)", "(11-12)"
    class: {
      type: String,
      // required: [true, "Class range is required"],
      trim: true,
    },

    // Description
    description: {
      type: String,
      trim: true,
    },
    // Active status
    isActive: {
      type: Boolean,
      default: true,
    },
    // Total questions available for this exam
    totalQuestions: {
      type: Number,
      default: 0,
    },
    // Admin who created this exam
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    fullName: {
      type: String,
      // required: [true, "Full name is required"],
      trim: true,
      // Enforce unique constraint
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
examSchema.index({ exam: 1, category: 1 });
// examSchema.index({ code: 1 });

// Pre-save hook to generate code and fullName automatically
examSchema.pre("save", function (next) {
  // Validate required fields
  if (!this.exam || !this.category || !this.subject || !this.class) {
    return next(
      new Error(
        "All fields (exam, category, subject, class) are required to generate fullName"
      )
    );
  }

  // Generate fullName from components
  this.fullName =
    `${this.exam} ${this.category} ${this.subject} ${this.class}`.trim();

  // // Generate code if not provided
  // if (!this.code) {
  //   this.code = `${this.exam}_${this.category}_${this.subject}_${this.class}`
  //     .toUpperCase()
  //     .replace(/[^A-Z0-9]/g, "_");
  // }

  next();
});

// Static method to get all active exams
examSchema.statics.getActiveExams = async function () {
  return this.find({ isActive: true }).sort({ exam: 1, category: 1 });
};

// Static method to get exams grouped by exam name
examSchema.statics.getGroupedExams = async function () {
  return this.aggregate([
    { $match: { isActive: true } },
    { $sort: { exam: 1, category: 1 } },
    {
      $group: {
        _id: "$exam",
        categories: {
          $push: {
            id: "$_id",
            fullName: "$fullName",
            category: "$category",
            subject: "$subject",
            class: "$class",
            totalQuestions: "$totalQuestions",
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

// Method to increment question count
examSchema.methods.incrementQuestionCount = async function () {
  this.totalQuestions += 1;
  return this.save();
};

// Method to decrement question count
examSchema.methods.decrementQuestionCount = async function () {
  if (this.totalQuestions > 0) {
    this.totalQuestions -= 1;
    return this.save();
  }
};

const Exam = mongoose.models.Exam || mongoose.model("Exam", examSchema);

export default Exam;

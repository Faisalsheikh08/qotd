import Submission from "../db/models/Submission";
import Question from "../db/models/Question";
import User from "../db/models/User";
import UserProgress from "../db/models/UserProgress";
import QuestionOfTheDay from "../db/models/QuestionOfTheDay";
import connectDB from "../db/connection";

export const submissionService = {
  async createSubmission(data) {
    await connectDB();

    const { userId, questionId, userAnswer, languagePreference, timeTaken } =
      data;

    // Check for duplicate
    const existing = await Submission.findOne({
      user: userId,
      question: questionId,
    });

    if (existing) {
      throw new Error("Already submitted for this question");
    }

    // Get question with correct answers
    const question = await Question.findById(questionId).select(
      "+englishCorrectAnswer +hindiCorrectAnswer +aICorrect"
    );

    if (!question) {
      throw new Error("Question not found");
    }

    // Verify answer (simplified)
    const verification = await this.verifyAnswer(
      userAnswer,
      question,
      languagePreference
    );

    // Create submission
    const submission = await Submission.create({
      user: userId,
      question: questionId,
      userAnswer: {
        english: languagePreference === "english" ? userAnswer : "",
        hindi: languagePreference === "hindi" ? userAnswer : "",
        languagePreference,
      },
      isCorrect: verification.isCorrect,
      confidence: verification.confidence,
      feedback: verification.feedback,
      pointsEarned: verification.isCorrect ? question.points : 0,
      timeTaken,
    });

    // Update user stats
    await this.updateUserStats(userId, submission, question);

    return submission;
  },

  async verifyAnswer(userAnswer, question, languagePreference) {
    // Simple verification logic (in production, use AI service)
    const correctAnswer =
      languagePreference === "english"
        ? question.englishCorrectAnswer
        : question.hindiCorrectAnswer;

    const userWords = userAnswer.toLowerCase().split(" ");
    const correctWords = correctAnswer.toLowerCase().split(" ");

    // Calculate similarity
    let matchCount = 0;
    correctWords.forEach((word) => {
      if (userWords.includes(word) && word.length > 3) {
        matchCount++;
      }
    });

    const confidence = Math.min(
      (matchCount / Math.max(correctWords.length, 5)) * 100,
      100
    );
    const isCorrect = confidence >= 60;

    return {
      isCorrect,
      confidence: Math.round(confidence),
      feedback: {
        english: isCorrect
          ? "Great job! Your answer is correct."
          : "Your answer needs improvement. Review the correct answer.",
        hindi: isCorrect
          ? "बहुत बढ़िया! आपका उत्तर सही है।"
          : "आपके उत्तर में सुधार की आवश्यकता है। सही उत्तर की समीक्षा करें।",
      },
    };
  },

  async updateUserStats(userId, submission, question) {
    const user = await User.findById(userId);
    if (user) {
      await user.updateStats(submission);
      await user.updateStreak();
      if (submission.isCorrect) {
        await user.addPoints(submission.pointsEarned);
      }
    }

    // Update user progress
    let userProgress = await UserProgress.findOne({
      user: userId,
      examType: question.examType,
    });

    if (!userProgress) {
      userProgress = await UserProgress.create({
        user: userId,
        examType: question.examType,
      });
    }

    await userProgress.updateAfterSubmission(submission, new Date());

    // Update QOTD stats
    const qotd = await QuestionOfTheDay.findOne({
      question: question._id,
      isActive: true,
    });

    if (qotd) {
      await qotd.incrementSubmissions(submission.isCorrect);
    }

    // Update question stats
    await question.incrementSubmissions(submission.isCorrect);
  },

  async getUserSubmissions(userId, page = 1, limit = 20) {
    await connectDB();

    const skip = (page - 1) * limit;

    const submissions = await Submission.find({ user: userId })
      .populate("question", "englishText hindiText subject difficulty points")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Submission.countDocuments({ user: userId });

    return {
      submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async getSubmissionById(submissionId) {
    await connectDB();

    return await Submission.findById(submissionId)
      .populate("question")
      .populate("user", "name email");
  },
};

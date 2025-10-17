import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db/connection";
import Submission from "@/lib/db/models/Submission";
import Question from "@/lib/db/models/Question";
import QuestionOfTheDay from "@/lib/db/models/QuestionOfTheDay";
import UserProgress from "@/lib/db/models/UserProgress";
import User from "@/lib/db/models/User";

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { questionId, userAnswer, languagePreference, timeTaken } = body;

    // Validate input
    if (!questionId || !userAnswer || !languagePreference) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get question with correct answers
    const question = await Question.findById(questionId).select(
      "+englishCorrectAnswer +hindiCorrectAnswer +aICorrect"
    );

    if (!question) {
      return NextResponse.json(
        { success: false, message: "Question not found" },
        { status: 404 }
      );
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      user: session.user.id,
      question: questionId,
    });

    if (existingSubmission) {
      return NextResponse.json(
        { success: false, message: "Already submitted for this question" },
        { status: 400 }
      );
    }

    // Simple verification (in production, use AI service)
    const correctAnswer =
      languagePreference === "english"
        ? question.englishCorrectAnswer
        : question.hindiCorrectAnswer;

    // Basic similarity check (simplified)
    const isCorrect = userAnswer
      .toLowerCase()
      .includes(correctAnswer.toLowerCase().split(" ").slice(0, 3).join(" "));

    const pointsEarned = isCorrect ? question.points : 0;

    // Create submission
    const submission = await Submission.create({
      user: session.user.id,
      question: questionId,
      userAnswer: {
        english: languagePreference === "english" ? userAnswer : "",
        hindi: languagePreference === "hindi" ? userAnswer : "",
        languagePreference,
      },
      isCorrect,
      confidence: isCorrect ? 90 : 40,
      feedback: {
        english: isCorrect ? "Great job!" : "Try again!",
        hindi: isCorrect ? "बहुत अच्छा!" : "फिर से कोशिश करें!",
      },
      pointsEarned,
      timeTaken,
    });

    // Update user stats
    const user = await User.findById(session.user.id);
    if (user) {
      await user.addPoints(pointsEarned);
      await user.updateStats(submission);
      await user.updateStreak();
    }

    // Update user progress
    let userProgress = await UserProgress.findOne({
      user: session.user.id,
      examType: question.examType,
    });

    if (!userProgress) {
      userProgress = await UserProgress.create({
        user: session.user.id,
        examType: question.examType,
      });
    }

    await userProgress.updateAfterSubmission(submission, new Date());

    // Update QOTD stats
    const qotd = await QuestionOfTheDay.findOne({
      question: questionId,
      isActive: true,
    });

    if (qotd) {
      await qotd.incrementSubmissions(isCorrect);
    }

    // Update question stats
    await question.incrementSubmissions(isCorrect);

    return NextResponse.json({
      success: true,
      data: {
        submission: {
          isCorrect,
          pointsEarned,
          feedback: submission.feedback,
          correctAnswer: {
            english: question.englishCorrectAnswer,
            hindi: question.hindiCorrectAnswer,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

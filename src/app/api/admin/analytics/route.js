import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db/connection";
import User from "@/lib/db/models/User";
import Question from "@/lib/db/models/Question";
import Submission from "@/lib/db/models/Submission";
import QuestionOfTheDay from "@/lib/db/models/QuestionOfTheDay";

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const totalUsers = await User.countDocuments();
    const totalQuestions = await Question.countDocuments({ isActive: true });
    const totalSubmissions = await Submission.countDocuments();
    const activeQOTDs = await QuestionOfTheDay.countDocuments({
      isActive: true,
    });

    // Get recent submissions
    const recentSubmissions = await Submission.find()
      .populate("user", "name email")
      .populate("question", "englishText subject")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get submission stats
    const submissionStats = await Submission.aggregate([
      {
        $group: {
          _id: null,
          totalCorrect: { $sum: { $cond: ["$isCorrect", 1, 0] } },
          totalIncorrect: { $sum: { $cond: ["$isCorrect", 0, 1] } },
          avgConfidence: { $avg: "$confidence" },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalQuestions,
          totalSubmissions,
          activeQOTDs,
        },
        submissionStats: submissionStats[0] || {},
        recentSubmissions,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

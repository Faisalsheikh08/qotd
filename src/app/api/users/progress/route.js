import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db/connection";
import UserProgress from "@/lib/db/models/UserProgress";

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const examType = searchParams.get("examType");

    const query = { user: session.user.id };
    if (examType) query.examType = examType;

    const progress = await UserProgress.find(query).populate(
      "examType",
      "fullName exam category"
    );

    return NextResponse.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================
// 10. src/app/api/admin/questions/route.js
// ============================================
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db/connection";
import Question from "@/lib/db/models/Question";
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    const questions = await Question.find()
      .populate("examType", "fullName")
      .populate("createdBy", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Question.countDocuments();

    return NextResponse.json({
      success: true,
      data: {
        questions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching admin questions:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { questionId, date, examType } = body;

    // Check if QOTD already exists for this date and exam
    const existing = await QuestionOfTheDay.findOne({
      date: new Date(date),
      examType,
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "QOTD already assigned for this date" },
        { status: 400 }
      );
    }

    const qotd = await QuestionOfTheDay.create({
      date: new Date(date),
      examType,
      question: questionId,
      assignedBy: session.user.id,
    });

    return NextResponse.json(
      {
        success: true,
        data: qotd,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error assigning QOTD:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================
// 11. src/app/api/admin/analytics/route.js
// ============================================
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

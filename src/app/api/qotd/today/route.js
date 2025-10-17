import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db/connection";
import QuestionOfTheDay from "@/lib/db/models/QuestionOfTheDay";
import Submission from "@/lib/db/models/Submission";

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

    // Get exam type from query params
    const { searchParams } = new URL(request.url);
    const examType = searchParams.get("examType");

    if (!examType) {
      return NextResponse.json(
        { success: false, message: "Exam type is required" },
        { status: 400 }
      );
    }

    // Get today's question
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const qotd = await QuestionOfTheDay.findOne({
      examType,
      date: { $gte: today, $lt: tomorrow },
      isActive: true,
    }).populate(
      "question",
      "-englishCorrectAnswer -hindiCorrectAnswer -aICorrect"
    );

    if (!qotd) {
      return NextResponse.json(
        { success: false, message: "No question available for today" },
        { status: 404 }
      );
    }

    // Check if user has already submitted
    const hasSubmitted = await Submission.exists({
      user: session.user.id,
      question: qotd.question._id,
    });

    return NextResponse.json({
      success: true,
      data: {
        qotd,
        hasSubmitted: !!hasSubmitted,
      },
    });
  } catch (error) {
    console.error("Error fetching QOTD:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

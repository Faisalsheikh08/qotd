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

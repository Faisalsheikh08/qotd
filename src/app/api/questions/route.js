import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db/connection";
import Question from "@/lib/db/models/Question";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const examType = searchParams.get("examType");
    const difficulty = searchParams.get("difficulty");
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    const query = { isActive: true };
    if (examType) query.examType = examType;
    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;

    const questions = await Question.find(query)
      .select("-englishCorrectAnswer -hindiCorrectAnswer -aICorrect")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Question.countDocuments(query);

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
    console.error("Error fetching questions:", error);
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
    const question = await Question.create({
      ...body,
      createdBy: session.user.id,
    });

    return NextResponse.json(
      {
        success: true,
        data: question,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

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


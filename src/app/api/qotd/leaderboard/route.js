import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import UserProgress from "@/lib/db/models/UserProgress";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const examType = searchParams.get("examType");
    const limit = parseInt(searchParams.get("limit")) || 100;

    const leaderboard = await UserProgress.getLeaderboard(examType, limit);

    return NextResponse.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

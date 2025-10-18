// src/app/api/user/activity/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db/connection";
import { activityService } from "@/lib/services/activityService";

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
    const type = searchParams.get("type"); // 'summary', 'calendar', 'streak', 'activities'
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;

    let result;

    switch (type) {
      case "summary":
        result = await activityService.getUserActivitySummary(session.user.id);
        break;

      case "streak":
        result = await activityService.getUserStreak(session.user.id);
        break;

      case "calendar":
        const year =
          parseInt(searchParams.get("year")) || new Date().getFullYear();
        const month =
          parseInt(searchParams.get("month")) || new Date().getMonth() + 1;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        result = await activityService.getUserActivityCalendar(
          session.user.id,
          startDate,
          endDate
        );
        break;

      case "daily":
        const date = searchParams.get("date") || new Date();
        result = await activityService.getDailyStats(
          session.user.id,
          new Date(date)
        );
        break;

      case "weekly":
        result = await activityService.getWeeklyStats(session.user.id);
        break;

      case "monthly":
        const y =
          parseInt(searchParams.get("year")) || new Date().getFullYear();
        const m =
          parseInt(searchParams.get("month")) || new Date().getMonth() + 1;
        result = await activityService.getMonthlyStats(session.user.id, y, m);
        break;

      default:
        // Get paginated activities
        result = await activityService.getUserActivities(
          session.user.id,
          page,
          limit
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

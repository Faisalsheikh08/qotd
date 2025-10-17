import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function requireAuth(request) {
  const session = await getServerSession();

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized - Please login" },
      { status: 401 }
    );
  }

  return session;
}

export async function requireAdmin(request) {
  const session = await requireAuth(request);

  if (session instanceof NextResponse) {
    return session; // Return error response
  }

  if (session.user.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Access denied - Admin only" },
      { status: 403 }
    );
  }

  return session;
}

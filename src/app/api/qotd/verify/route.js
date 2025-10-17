import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db/connection";

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
    const { userAnswer, correctAnswers, languagePreference } = body;

    // In production, integrate with Grok AI API
    // For now, simple keyword matching
    const correctAnswer =
      languagePreference === "english"
        ? correctAnswers.english
        : correctAnswers.hindi;

    const keywords = correctAnswer.toLowerCase().split(" ").slice(0, 5);
    const userWords = userAnswer.toLowerCase().split(" ");

    let matchCount = 0;
    keywords.forEach((keyword) => {
      if (userWords.includes(keyword)) matchCount++;
    });

    const confidence = Math.min((matchCount / keywords.length) * 100, 100);
    const isCorrect = confidence >= 60;

    return NextResponse.json({
      success: true,
      data: {
        isCorrect,
        confidence: Math.round(confidence),
        feedback: {
          english: isCorrect
            ? "Your answer is correct!"
            : "Your answer needs improvement.",
          hindi: isCorrect
            ? "आपका उत्तर सही है!"
            : "आपके उत्तर में सुधार की आवश्यकता है।",
        },
      },
    });
  } catch (error) {
    console.error("Error verifying answer:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

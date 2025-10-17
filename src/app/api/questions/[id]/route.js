import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db/connection";
import Question from "@/lib/db/models/Question";

// export async function GET(request, { params }) {
//   try {
//     await connectDB();

//     const question = await Question.findById(params._id).select(
//       "-englishCorrectAnswer -hindiCorrectAnswer -aiCorrect"
//     );

//     if (!question) {
//       return NextResponse.json(
//         { success: false, message: "Question not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       data: question,
//     });
//   } catch (error) {
//     console.error("Error fetching question:", error);
//     return NextResponse.json(
//       { success: false, message: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

export async function GET(request, { params }) {
  try {
    const { id } = await params; // NO await here!
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing question ID" },
        { status: 400 }
      );
    }

    await connectDB();

    // Use findById for simplicity
    // const question = await Question.find();
    const question = await Question.findOne({ _id: id });

    if (!question) {
      return NextResponse.json(
        { success: false, message: "Question not found", question },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Error fetching question:", error);

    // Handle invalid ObjectId
    if (error.kind === "ObjectId") {
      return NextResponse.json(
        { success: false, message: "Invalid question ID" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
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
    const question = await Question.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!question) {
      return NextResponse.json(
        { success: false, message: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const question = await Question.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );

    if (!question) {
      return NextResponse.json(
        { success: false, message: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

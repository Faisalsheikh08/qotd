import { NextResponse } from "next/server";
import { AppError } from "../utils/errors";

export function errorHandler(error) {
  console.error("Error:", error);

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        errors: error.errors || null,
      },
      { status: error.statusCode }
    );
  }

  // MongoDB duplicate key error
  if (error.code === 11000) {
    return NextResponse.json(
      {
        success: false,
        message: "Duplicate entry - Resource already exists",
      },
      { status: 409 }
    );
  }

  // MongoDB validation error
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((e) => e.message);
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed",
        errors,
      },
      { status: 400 }
    );
  }

  // Default error
  return NextResponse.json(
    {
      success: false,
      message: "Internal server error",
    },
    { status: 500 }
  );
}

// Async error wrapper
export function asyncHandler(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      return errorHandler(error);
    }
  };
}

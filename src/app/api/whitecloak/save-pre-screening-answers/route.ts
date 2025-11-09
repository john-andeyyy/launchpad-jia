import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { interviewID, preScreeningAnswers } = await request.json();

    if (!interviewID) {
      return NextResponse.json(
        { error: "Interview ID is required" },
        { status: 400 }
      );
    }

    if (!preScreeningAnswers || !Array.isArray(preScreeningAnswers)) {
      return NextResponse.json(
        { error: "Pre-screening answers must be an array" },
        { status: 400 }
      );
    }

    const { db } = await connectMongoDB();

    // Save organized answers as array: [{ id, question, answer }]
    await db.collection("interviews").updateOne(
      { interviewID: interviewID },
      {
        $set: {
          preScreeningAnswers: preScreeningAnswers,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      message: "Pre-screening answers saved successfully",
    });
  } catch (error) {
    console.error("Error saving pre-screening answers:", error);
    return NextResponse.json(
      { error: "Failed to save pre-screening answers" },
      { status: 500 }
    );
  }
}


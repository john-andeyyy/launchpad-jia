import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { guid } from "@/lib/Utils";
import { ObjectId } from "mongodb";
import { addCareerSchema } from "@/lib/Validation/careerValidation";

export async function POST(request: Request) {
  try {
    const requestData = await request.json();

    // Validate and sanitize input using Zod schema
    const validationResult = addCareerSchema.safeParse(requestData);

    if (!validationResult.success) {
      // Collect all validation errors
      const errors: string[] = [];
      
      validationResult.error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        const message = issue.message;
        errors.push(`${field ? `${field}: ` : ""}${message}`);
      });

      return NextResponse.json(
        {
          errors: errors,
          error: "Validation failed",
        },
        { status: 400 }
      );
    }

    // Use validated and sanitized data
    const {
      jobTitle,
      description,
      questions,
      lastEditedBy,
      createdBy,
      screeningSetting,
      orgID,
      requireVideo,
      secretPrompt,
      cvSecretPrompt,
      aiInterviewSecretPrompt,
      preScreeningQuestions,
      location,
      workSetup,
      workSetupRemarks,
      status,
      salaryNegotiable,
      minimumSalary,
      maximumSalary,
      country,
      province,
      employmentType,
      teamMembers,
    } = validationResult.data;

    const { db } = await connectMongoDB();

    const orgDetails = await db.collection("organizations").aggregate([
      {
        $match: {
          _id: new ObjectId(orgID)
        }
      },
      {
        $lookup: {
            from: "organization-plans",
            let: { planId: "$planId" },
            pipeline: [
                {
                    $addFields: {
                        _id: { $toString: "$_id" }
                    }
                },
                {
                    $match: {
                        $expr: { $eq: ["$_id", "$$planId"] }
                    }
                }
            ],
            as: "plan"
        }
      },
      {
        $unwind: "$plan"
      },
    ]).toArray();

    if (!orgDetails || orgDetails.length === 0) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const totalActiveCareers = await db.collection("careers").countDocuments({ orgID, status: "active" });

    if (totalActiveCareers >= (orgDetails[0].plan.jobLimit + (orgDetails[0].extraJobSlots || 0))) {
      return NextResponse.json({ error: "You have reached the maximum number of jobs for your plan" }, { status: 400 });
    }

    const career = {
      id: guid(),
      jobTitle,
      description,
      questions,
      location,
      workSetup,
      workSetupRemarks,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastEditedBy,
      createdBy,
      status: status || "active",
      screeningSetting,
      orgID,
      requireVideo,
      // Use new separate prompts if provided, otherwise fall back to old secretPrompt for backwards compatibility
      cvSecretPrompt: cvSecretPrompt || secretPrompt || "",
      aiInterviewSecretPrompt: aiInterviewSecretPrompt || secretPrompt || "",
      secretPrompt: secretPrompt || cvSecretPrompt || "", // Keep for backwards compatibility
      preScreeningQuestions: preScreeningQuestions || [],
      lastActivityAt: new Date(),
      salaryNegotiable,
      minimumSalary,
      maximumSalary,
      country,
      province,
      employmentType,
      teamMembers: teamMembers || [],
    };

    await db.collection("careers").insertOne(career);

    return NextResponse.json({
      message: "Career added successfully",
      career,
    });
  } catch (error) {
    console.error("Error adding career:", error);
    return NextResponse.json(
      { error: "Failed to add career" },
      { status: 500 }
    );
  }
}

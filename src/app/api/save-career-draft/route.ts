import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

// Helper function to prepare draft data
function prepareDraftData(data: any) {
    return {
        orgID: data.orgID,
        userEmail: data.userEmail,
        currentStep: data.currentStep || 1,
        jobTitle: data.jobTitle || "",
        description: data.description || "",
        workSetup: data.workSetup || "",
        workSetupRemarks: data.workSetupRemarks || "",
        screeningSetting: data.screeningSetting || "Good Fit and above",
        employmentType: data.employmentType || "",
        requireVideo: data.requireVideo !== undefined ? data.requireVideo : true,
        cvSecretPrompt: data.cvSecretPrompt || "",
        aiInterviewSecretPrompt: data.aiInterviewSecretPrompt || "",
        secretPrompt: data.secretPrompt || data.cvSecretPrompt || "",
        preScreeningQuestions: data.preScreeningQuestions || [],
        salaryNegotiable: data.salaryNegotiable !== undefined ? data.salaryNegotiable : true,
        minimumSalary: data.minimumSalary || "",
        maximumSalary: data.maximumSalary || "",
        questions: data.questions || [
            {
                id: 1,
                category: "CV Validation / Experience",
                questionCountToAsk: null,
                questions: [],
            },
            {
                id: 2,
                category: "Technical",
                questionCountToAsk: null,
                questions: [],
            },
            {
                id: 3,
                category: "Behavioral",
                questionCountToAsk: null,
                questions: [],
            },
            {
                id: 4,
                category: "Analytical",
                questionCountToAsk: null,
                questions: [],
            },
            {
                id: 5,
                category: "Others",
                questionCountToAsk: null,
                questions: [],
            },
        ],
        country: data.country || "Philippines",
        province: data.province || "",
        city: data.city || "",
        teamMembers: data.teamMembers || [],
    };
}

// POST - Create new draft
export async function POST(request: Request) {
    try {
        const requestData = await request.json();

        // Validate required fields
        if (!requestData.orgID || !requestData.userEmail) {
            return NextResponse.json(
                { error: "Organization ID and user email are required" },
                { status: 400 }
            );
        }

        const { db } = await connectMongoDB();

        // Check if draft already exists
        const existingDraft = await db.collection("career-drafts").findOne({
            orgID: requestData.orgID,
            userEmail: requestData.userEmail,
        });

        if (existingDraft) {
            return NextResponse.json(
                { error: "Draft already exists. Use PUT to update." },
                { status: 409 } // Conflict
            );
        }

        const draftData = {
            ...prepareDraftData(requestData),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.collection("career-drafts").insertOne(draftData);

        return NextResponse.json(
            {
                message: "Career draft created successfully",
                success: true,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating career draft:", error);
        return NextResponse.json(
            { error: "Failed to create career draft" },
            { status: 500 }
        );
    }
}

// PUT - Update existing draft
export async function PUT(request: Request) {
    try {
        const requestData = await request.json();

        // Validate required fields
        if (!requestData.orgID || !requestData.userEmail) {
            return NextResponse.json(
                { error: "Organization ID and user email are required" },
                { status: 400 }
            );
        }

        const { db } = await connectMongoDB();

        // Check if draft exists
        const existingDraft = await db.collection("career-drafts").findOne({
            orgID: requestData.orgID,
            userEmail: requestData.userEmail,
        });

        if (!existingDraft) {
            return NextResponse.json(
                { error: "Draft not found. Use POST to create." },
                { status: 404 }
            );
        }

        const draftData = {
            ...prepareDraftData(requestData),
            updatedAt: new Date(),
        };

        await db.collection("career-drafts").updateOne(
            { orgID: requestData.orgID, userEmail: requestData.userEmail },
            { $set: draftData }
        );

        return NextResponse.json({
            message: "Career draft updated successfully",
            success: true,
        });
    } catch (error) {
        console.error("Error updating career draft:", error);
        return NextResponse.json(
            { error: "Failed to update career draft" },
            { status: 500 }
        );
    }
}


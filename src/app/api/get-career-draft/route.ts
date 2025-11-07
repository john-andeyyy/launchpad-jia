import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function POST(request: Request) {
    try {
        const { orgID, userEmail } = await request.json();

        // Validate required fields
        if (!orgID || !userEmail) {
            return NextResponse.json(
                { error: "Organization ID and user email are required" },
                { status: 400 }
            );
        }

        const { db } = await connectMongoDB();

        const draft = await db.collection("career-drafts").findOne({
            orgID,
            userEmail,
        });

        if (!draft) {
            return NextResponse.json({
                message: "No draft found",
                draft: null,
            });
        }

        // Remove MongoDB _id and other internal fields before sending
        const { _id, ...draftData } = draft;

        return NextResponse.json({
            message: "Career draft retrieved successfully",
            draft: draftData,
        });
    } catch (error) {
        console.error("Error retrieving career draft:", error);
        return NextResponse.json(
            { error: "Failed to retrieve career draft" },
            { status: 500 }
        );
    }
}

// Also support DELETE endpoint to clear draft after successful save
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const orgID = searchParams.get("orgID");
        const userEmail = searchParams.get("userEmail");

        // Validate required fields
        if (!orgID || !userEmail) {
            return NextResponse.json(
                { error: "Organization ID and user email are required" },
                { status: 400 }
            );
        }

        const { db } = await connectMongoDB();

        await db.collection("career-drafts").deleteOne({
            orgID,
            userEmail,
        });

        return NextResponse.json({
            message: "Career draft deleted successfully",
            success: true,
        });
    } catch (error) {
        console.error("Error deleting career draft:", error);
        return NextResponse.json(
            { error: "Failed to delete career draft" },
            { status: 500 }
        );
    }
}


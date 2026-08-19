import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { matchStudentAndOpportunity, matchStudentWithAllOpportunities, matchOpportunityWithAllStudents } from "@/lib/matching/pipeline";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentProfileId = searchParams.get("studentProfileId");
    const opportunityId = searchParams.get("opportunityId");
    const providerName = searchParams.get("provider") || "gemini";

    if (studentProfileId && !opportunityId) {
      // Find matches for this student across all verified opportunities
      const matches = await matchStudentWithAllOpportunities(studentProfileId, providerName);
      return NextResponse.json(matches);
    }

    if (opportunityId && !studentProfileId) {
      // Find candidate matches for this opportunity across all students
      const candidateMatches = await matchOpportunityWithAllStudents(opportunityId, providerName);
      return NextResponse.json(candidateMatches);
    }

    if (studentProfileId && opportunityId) {
      // Match specific pair
      const result = await matchStudentAndOpportunity({
        studentProfileId,
        opportunityId,
        providerName,
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Specify studentProfileId or opportunityId" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentProfileId, opportunityId, providerName = "gemini", modelName } = body;

    if (!studentProfileId || !opportunityId) {
      return NextResponse.json(
        { error: "Both studentProfileId and opportunityId are required." },
        { status: 400 }
      );
    }

    const result = await matchStudentAndOpportunity({
      studentProfileId,
      opportunityId,
      providerName,
      modelName,
      saveToDb: true,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

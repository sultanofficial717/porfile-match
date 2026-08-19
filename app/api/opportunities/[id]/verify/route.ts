import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes, adminId } = body; // status: "Verified" | "Rejected" | "Pending" | "Expired"

    let targetAdminId = adminId;
    if (!targetAdminId) {
      const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      targetAdminId = admin?.id || "admin";
    }

    const updated = await prisma.opportunity.update({
      where: { id },
      data: {
        verificationStatus: status,
        verifiedAt: status === "Verified" ? new Date() : null,
        verifiedBy: status === "Verified" ? targetAdminId : null,
      },
    });

    await prisma.verification.create({
      data: {
        opportunityId: id,
        adminId: targetAdminId,
        status,
        notes: notes || `Verification status changed to ${status}`,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

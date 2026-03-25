import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import MedicalRecord from "@/lib/models/MedicalRecord"

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect()
        const { id } = await params
        const body = await request.json()

        const updatedRecord = await MedicalRecord.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true }
        )

        if (!updatedRecord) {
            return NextResponse.json({ error: "Medical record not found" }, { status: 404 })
        }

        return NextResponse.json(updatedRecord)
    } catch (error) {
        console.error("Failed to update medical record:", error)
        return NextResponse.json({ error: "Failed to update medical record" }, { status: 500 })
    }
}

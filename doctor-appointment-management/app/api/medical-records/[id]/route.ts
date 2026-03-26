import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        const { data: updatedRecord, error } = await supabase
            .from("medicalrecords")
            .update(body)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Supabase update error:", error)
            return NextResponse.json({ error: "Failed to update medical record" }, { status: 500 })
        }

        if (!updatedRecord) {
            return NextResponse.json({ error: "Medical record not found" }, { status: 404 })
        }

        return NextResponse.json(updatedRecord)
    } catch (error) {
        console.error("Failed to update medical record:", error)
        return NextResponse.json({ error: "Failed to update medical record" }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { error } = await supabase
            .from("medicalrecords")
            .delete()
            .eq("id", id)

        if (error) {
            console.error("Supabase delete error:", error)
            return NextResponse.json({ error: "Failed to delete medical record" }, { status: 500 })
        }

        return NextResponse.json({ message: "Medical record deleted successfully" })
    } catch (error) {
        console.error("Failed to delete medical record:", error)
        return NextResponse.json({ error: "Failed to delete medical record" }, { status: 500 })
    }
}

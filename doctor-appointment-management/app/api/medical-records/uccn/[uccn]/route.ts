import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getAuthSession } from "@/lib/auth"

export async function GET(
    request: Request,
    { params }: { params: { uccn: string } }
) {
    try {
        // Optional: auth session check
        // const session = await getAuthSession()
        // if (!session) {
        //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        // }

        const { uccn } = await params

        if (!uccn) {
            return NextResponse.json({ error: "UCCN is required" }, { status: 400 })
        }

        // Fetch medical records by citizen_id directly
        const { data, error } = await supabase
            .from("medicalrecords")
            .select("*")
            .eq("citizen_id", uccn)
            .order("date", { ascending: false })

        if (error) throw error

        return NextResponse.json(data)
    } catch (error: any) {
        console.error("Failed to fetch medical records by UCCN:", error)
        return NextResponse.json({ 
            error: "Failed to fetch medical records",
            details: error.message || "Unknown error" 
        }, { status: 500 })
    }
}

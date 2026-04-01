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

        // Fetch prescriptions by citizen_id directly
        const { data, error } = await supabase
            .from("prescriptions")
            .select("*")
            .eq("citizen_id", uccn)
            .order("created_at", { ascending: false })

        if (error) throw error

        return NextResponse.json(data)
    } catch (error: any) {
        console.error("Failed to fetch prescriptions by UCCN:", error)
        return NextResponse.json({ 
            error: "Failed to fetch prescriptions",
            details: error.message || "Unknown error" 
        }, { status: 500 })
    }
}

import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import OPD from "@/lib/models/OPD"
import { getAuthSession } from "@/lib/auth"

export async function GET() {
    try {
        const session = await getAuthSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await dbConnect()
        const now = new Date()
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        // Count records created today to generate the next sequence number
        const count = await OPD.countDocuments({
            createdAt: { $gte: startOfDay }
        })

        return NextResponse.json({ sequence: count + 1 })
    } catch (error) {
        console.error("Failed to fetch sequence:", error)
        return NextResponse.json({ error: "Failed to fetch sequence" }, { status: 500 })
    }
}

import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { supabase } from "@/lib/supabase"

const JWT_SECRET = process.env.JWT_SECRET || "healthcare-secret-key-2026"

export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("token")?.value

        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        const decoded: any = jwt.verify(token, JWT_SECRET)

        const { data: user, error } = await supabase
            .from("users")
            .select("id, name, email, role, created_at")
            .eq("id", decoded.id)
            .single()

        if (error || !user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json({ user })
    } catch (error) {
        console.error("Auth Me error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

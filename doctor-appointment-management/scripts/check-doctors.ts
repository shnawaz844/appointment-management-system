import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
    const { data: doctors, error } = await supabase.from("doctors").select("*")
    console.log("DOCTORS:", doctors)
    if (error) console.error("Error fetching doctors:", error)
}
check()

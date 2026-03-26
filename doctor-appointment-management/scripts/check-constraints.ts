import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
    const { data, error } = await supabase.rpc('get_check_constraints', { table_name: 'imagingstudies' })
    if (error) {
        // Fallback: try querying information_schema via raw SQL if possible
        const { data: raw, error: rawError } = await supabase.from('information_schema.check_constraints').select('*')
        console.log("CHECK CONSTRAINTS:", raw || rawError)
    } else {
        console.log("CONSTRAINTS:", data)
    }
}
// Actually, I'll try a simpler way: just check the Error message details if they were more specific.
// But the user already gave it.
// I'll try to find any migration or SQL file in the repo.
check()

import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

async function checkData() {
    const { data } = await supabase.from("medicalrecords").select("id, attachment_url")
    console.log("Current medicalrecords storage URLs:")
    console.log(JSON.stringify(data, null, 2))
}

checkData()

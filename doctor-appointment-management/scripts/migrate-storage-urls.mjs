import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase configuration in .env.local")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrate() {
    console.log("🚀 Starting storage URL migration...")

    // 1. Migrate Medical Records
    console.log("\n📁 Migrating medicalrecords...")
    const { data: records, error: rError } = await supabase
        .from("medicalrecords")
        .select("id, attachment_url")
        .not("attachment_url", "is", null)

    if (rError) {
        console.error("Error fetching medical records:", rError)
    } else {
        let count = 0
        for (const record of records) {
            if (record.attachment_url.includes("/storage/v1/object/public/")) {
                const parts = record.attachment_url.split("/public/")
                if (parts.length > 1) {
                    const newUrl = `/api/storage/${parts[1]}`
                    const { error } = await supabase
                        .from("medicalrecords")
                        .update({ attachment_url: newUrl })
                        .eq("id", record.id)
                    
                    if (!error) count++
                }
            }
        }
        console.log(`✅ Updated ${count} medical records.`)
    }

    // 2. Migrate Patients
    console.log("\n👥 Migrating patients...")
    const { data: patients, error: pError } = await supabase
        .from("patients")
        .select("id, report_url")
        .not("report_url", "is", null)

    if (pError) {
        console.error("Error fetching patients:", pError)
    } else {
        let count = 0
        for (const patient of patients) {
            if (patient.report_url.includes("/storage/v1/object/public/")) {
                const parts = patient.report_url.split("/public/")
                if (parts.length > 1) {
                    const newUrl = `/api/storage/${parts[1]}`
                    const { error } = await supabase
                        .from("patients")
                        .update({ report_url: newUrl })
                        .eq("id", patient.id)
                    
                    if (!error) count++
                }
            }
        }
        console.log(`✅ Updated ${count} patients.`)
    }

    // 3. Migrate Imaging Studies (thumbnails can be JSON strings)
    console.log("\n🖼️ Migrating imagingstudies...")
    const { data: studies, error: sError } = await supabase
        .from("imagingstudies")
        .select("id, thumbnail")
        .not("thumbnail", "is", null)

    if (sError) {
        console.error("Error fetching imaging studies:", sError)
    } else {
        let count = 0
        for (const study of studies) {
            let updatedThumbnail = study.thumbnail
            let changed = false

            if (study.thumbnail.startsWith("[") || study.thumbnail.includes("/storage/v1/object/public/")) {
                try {
                    // Try to parse if it's a JSON array
                    let urls = []
                    try {
                        urls = JSON.parse(study.thumbnail)
                        if (!Array.isArray(urls)) urls = [study.thumbnail]
                    } catch {
                        urls = [study.thumbnail]
                    }

                    const newUrls = urls.map(url => {
                        if (typeof url === "string" && url.includes("/storage/v1/object/public/")) {
                            const parts = url.split("/public/")
                            if (parts.length > 1) {
                                changed = true
                                return `/api/storage/${parts[1]}`
                            }
                        }
                        return url
                    })

                    updatedThumbnail = Array.isArray(JSON.parse(study.thumbnail)) 
                        ? JSON.stringify(newUrls) 
                        : newUrls[0]
                } catch {
                    // Fallback for non-JSON strings
                    if (study.thumbnail.includes("/storage/v1/object/public/")) {
                        const parts = study.thumbnail.split("/public/")
                        if (parts.length > 1) {
                            updatedThumbnail = `/api/storage/${parts[1]}`
                            changed = true
                        }
                    }
                }

                if (changed) {
                    const { error } = await supabase
                        .from("imagingstudies")
                        .update({ thumbnail: updatedThumbnail })
                        .eq("id", study.id)
                    
                    if (!error) count++
                }
            }
        }
        console.log(`✅ Updated ${count} imaging studies.`)
    }

    console.log("\n🏁 Migration finished!")
}

migrate()

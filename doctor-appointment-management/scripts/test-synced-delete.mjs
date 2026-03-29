import { createClient } from "@supabase/supabase-js"
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
const s3Client = new S3Client({
    forcePathStyle: true,
    region: process.env.SUPABASE_S3_REGION || "ap-northeast-1",
    endpoint: process.env.SUPABASE_S3_ENDPOINT || "https://ovfntwpehxejgwtcpifu.storage.supabase.co/storage/v1/s3",
    credentials: {
        accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY || "",
        secretAccessKey: process.env.SUPABASE_S3_SECRET_KEY || "",
    }
})

async function testDelete() {
    console.log("🔍 Testing synchronized deletion...")

    // 1. Find a record with an attachment
    const { data: records } = await supabase
        .from("medicalrecords")
        .select("*")
        .not("attachment_url", "is", null)
        .limit(1)

    if (!records || records.length === 0) {
        console.log("⚠️ No records with attachments found to test deletion.")
        return
    }

    const testRecord = records[0]
    console.log(`Test Record found: ${testRecord.id} with attachment: ${testRecord.attachment_url}`)

    // 2. Extract path
    let storagePath = ""
    if (testRecord.attachment_url.includes("/api/storage/uploads/")) {
        storagePath = testRecord.attachment_url.split("/api/storage/uploads/")[1]
    } else if (testRecord.attachment_url.includes("/public/uploads/")) {
        storagePath = testRecord.attachment_url.split("/public/uploads/")[1]
    }

    if (!storagePath) {
        console.log("⚠️ Could not extract storage path from URL.")
        return
    }

    console.log(`Target storage path: ${storagePath}`)

    // 3. Confirm file exists in S3 before delete
    const listCmd = new ListObjectsV2Command({
        Bucket: "uploads",
        Prefix: storagePath
    })
    const listRes = await s3Client.send(listCmd)
    const existsBefore = listRes.Contents?.some(c => c.Key === storagePath)
    
    if (existsBefore) {
        console.log("✅ File exists in S3 before deletion.")
    } else {
        console.log("❌ File DOES NOT exist in S3 even before deletion. Aborting test.")
        return
    }

    // 4. Trigger DELETE API
    console.log(`🗑️ Triggering DELETE API for ${testRecord.id}...`)
    // Note: We'll use absolute URL for the API call if possible, or just mock the call.
    // For this test, we'll actually call the server if it's running, or just manually run the logic.
    // Since I'm on the machine, I'll just run the delete logic manually to verify the S3 part.
}

testDelete()

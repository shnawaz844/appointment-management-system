const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
require("dotenv").config({ path: ".env.local" });

const s3Client = new S3Client({
    forcePathStyle: true,
    region: process.env.SUPABASE_S3_REGION || "ap-northeast-1",
    endpoint: process.env.SUPABASE_S3_ENDPOINT || "https://ovfntwpehxejgwtcpifu.storage.supabase.co/storage/v1/s3",
    credentials: {
        accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY || "",
        secretAccessKey: process.env.SUPABASE_S3_SECRET_KEY || "",
    }
});

async function listFiles() {
    try {
        const command = new ListObjectsV2Command({
            Bucket: "uploads",
        });
        const response = await s3Client.send(command);
        console.log("All files in uploads bucket:");
        console.log(JSON.stringify(response.Contents, null, 2));
    } catch (error) {
        console.error("Error listing files:", error);
    }
}

listFiles();

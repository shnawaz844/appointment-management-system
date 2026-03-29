const projectId = "ovfntwpehxejgwtcpifu";
const bucket = "uploads";
// Use the exact filename from the user's screenshot
const path = "patients/001/1774814176464-254875505-htmlCode.pdf";
const publicUrl = `https://${projectId}.supabase.co/storage/v1/object/public/${bucket}/${path}`;

async function checkPublicAccess() {
    try {
        console.log(`Checking public access for: ${publicUrl}`);
        const response = await fetch(publicUrl);
        console.log(`Status: ${response.status}`);
        const text = await response.text();
        console.log(`Body: ${text}`);
        if (response.ok) {
            console.log("Access successful!");
        } else {
            console.log("Access failed!");
        }
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
}

checkPublicAccess();

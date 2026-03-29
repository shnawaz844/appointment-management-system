const projectId = "ovfntwpehxejgwtcpifu";
const bucket = "uploads";
// Use the exact filename from the user's screenshot
const path = "patients/001/1774814176464-254875505-htmlCode.pdf";
const alternativeUrl = `https://${projectId}.storage.supabase.co/storage/v1/object/public/${bucket}/${path}`;

async function checkAlternativeAccess() {
    try {
        console.log(`Checking alternative access for: ${alternativeUrl}`);
        const response = await fetch(alternativeUrl);
        console.log(`Status: ${response.status}`);
        const text = await response.text();
        console.log(`Body: ${text}`);
        if (response.ok) {
            console.log("Access successful via STORAGE subdomain!");
        } else {
            console.log("Access failed via STORAGE subdomain!");
        }
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
}

checkAlternativeAccess();

const axios = require("axios");

const projectId = "ovfntwpehxejgwtcpifu";
const bucket = "uploads";
const path = "patients/001/1774813754239-58123261-htmlCode.pdf";
const publicUrl = `https://${projectId}.supabase.co/storage/v1/object/public/${bucket}/${path}`;

async function checkPublicAccess() {
    try {
        console.log(`Checking public access for: ${publicUrl}`);
        const response = await axios.get(publicUrl);
        console.log(`Status: ${response.status}`);
        console.log("Access successful!");
    } catch (error) {
        console.log(`Access failed!`);
        if (error.response) {
            console.log(`Status: ${error.response.status}`);
            console.log(`Body: ${JSON.stringify(error.response.data)}`);
        } else {
            console.log(`Error: ${error.message}`);
        }
    }
}

checkPublicAccess();

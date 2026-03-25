
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://ovfntwpehxejgwtcpifu.supabase.co";
const supabaseKey = "sb_publishable_ewJkoeJsLgeq2bd8x_VKWg_cwBdbF80";
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPatient() {
    console.log("Checking for patient: Kamal vimal");
    try {
        const { data, error } = await supabase
            .from("patients")
            .select("*")
            .ilike("name", "%Kamal%vimal%");
        
        if (error) {
            console.error("Error fetching patient:", error);
        } else {
            console.log("Matching patients:", JSON.stringify(data, null, 2));
        }

        console.log("\nChecking recent patients:");
        const { data: recent, error: rError } = await supabase
            .from("patients")
            .select("id, name, created_at, doctor")
            .order("created_at", { ascending: false })
            .limit(10);
        
        if (rError) {
            console.error("Error fetching recent patients:", rError);
        } else {
            console.log("Recent patients:", JSON.stringify(recent, null, 2));
        }
    } catch (e) {
        console.error("Unhandled error:", e);
    }
}

checkPatient();

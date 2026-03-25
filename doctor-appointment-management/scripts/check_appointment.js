
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://ovfntwpehxejgwtcpifu.supabase.co";
const supabaseKey = "sb_publishable_ewJkoeJsLgeq2bd8x_VKWg_cwBdbF80";
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAppointment() {
    console.log("Checking for appointment: Kamal vimal");
    const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .ilike("patient_name", "%Kamal%vimal%");
    
    if (error) {
        console.error("Error fetching appointment:", error);
    } else {
        console.log("Matching appointments:", JSON.stringify(data, null, 2));
    }
}

checkAppointment();

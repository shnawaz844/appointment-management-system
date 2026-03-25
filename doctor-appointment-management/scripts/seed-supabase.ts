import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import { mockPatients, diagnosisData, mockReports, extendedSearchResults } from "../lib/data"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_ANON_KEY in .env.local")
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ─── Appointments ────────────────────────────────────────────
const appointments = [
    { id: "APT001", patient_name: "Rajesh Kumar", patient_id: "P001", date: "2024-12-25", time: "10:00 AM", doctor: "Dr. Sharma", specialty: "Orthopedics", type: "Follow-up", status: "Scheduled", phone: "+91-9876543210" },
    { id: "APT002", patient_name: "Priya Nair", patient_id: "P002", date: "2024-12-26", time: "02:30 PM", doctor: "Dr. Singh", specialty: "Orthopedics", type: "Post-Surgery", status: "Scheduled", phone: "+91-9876543211" },
    { id: "APT003", patient_name: "Arjun Patel", patient_id: "P003", date: "2024-12-27", time: "11:15 AM", doctor: "Dr. Verma", specialty: "Orthopedics", type: "Initial Consultation", status: "Confirmed", phone: "+91-9876543212" },
    { id: "APT004", patient_name: "Meera Gupta", patient_id: "P004", date: "2024-12-28", time: "03:45 PM", doctor: "Dr. Sharma", specialty: "Orthopedics", type: "Check-up", status: "Scheduled", phone: "+91-9876543213" },
]

// ─── Lab Results ─────────────────────────────────────────────
const labResults = [
    {
        id: "LAB001", patient_name: "Rajesh Kumar", patient_id: "P001", doctor: "Dr. Sharma",
        test_name: "Blood Count (CBC)", test_type: "Blood Test", date: "2024-12-20",
        status: "Complete", result: "Normal",
        interpretation: "All values within normal range. No abnormalities detected.",
        values: [
            { name: "WBC", result: "7.2", unit: "K/uL", normalRange: "4.5-11.0" },
            { name: "RBC", result: "4.8", unit: "M/uL", normalRange: "4.5-5.5" },
            { name: "Hemoglobin", result: "14.2", unit: "g/dL", normalRange: "13.5-17.5" },
            { name: "Hematocrit", result: "42%", unit: "%", normalRange: "41-53" },
            { name: "Platelets", result: "245", unit: "K/uL", normalRange: "150-400" },
        ],
    },
    {
        id: "LAB002", patient_name: "Priya Nair", patient_id: "P002", doctor: "Dr. Singh",
        test_name: "Metabolic Panel", test_type: "Blood Test", date: "2024-12-21",
        status: "Complete", result: "Normal",
        interpretation: "Metabolic parameters normal. Kidney and liver function adequate.",
        values: [
            { name: "Glucose", result: "95", unit: "mg/dL", normalRange: "70-100" },
            { name: "Sodium", result: "138", unit: "mEq/L", normalRange: "135-145" },
            { name: "Potassium", result: "4.1", unit: "mEq/L", normalRange: "3.5-5.0" },
            { name: "Creatinine", result: "0.9", unit: "mg/dL", normalRange: "0.7-1.3" },
            { name: "BUN", result: "18", unit: "mg/dL", normalRange: "7-20" },
        ],
    },
    {
        id: "LAB003", patient_name: "Arjun Patel", patient_id: "P003", doctor: "Dr. Verma",
        test_name: "Thyroid Function", test_type: "Blood Test", date: "2024-12-22",
        status: "Pending", result: "Awaiting",
        interpretation: "Test results pending. Expected completion by 2024-12-23.",
        values: [
            { name: "TSH", result: "Pending", unit: "mIU/L", normalRange: "0.4-4.0" },
            { name: "T3", result: "Pending", unit: "ng/dL", normalRange: "80-200" },
            { name: "T4", result: "Pending", unit: "ng/dL", normalRange: "4.5-12" },
        ],
    },
    {
        id: "LAB004", patient_name: "Meera Gupta", patient_id: "P004", doctor: "Dr. Sharma",
        test_name: "Lipid Panel", test_type: "Blood Test", date: "2024-12-19",
        status: "Complete", result: "Borderline",
        interpretation: "Borderline high cholesterol and triglycerides. Dietary modifications recommended.",
        values: [
            { name: "Total Cholesterol", result: "220", unit: "mg/dL", normalRange: "<200" },
            { name: "LDL", result: "145", unit: "mg/dL", normalRange: "<100" },
            { name: "HDL", result: "38", unit: "mg/dL", normalRange: ">40" },
            { name: "Triglycerides", result: "180", unit: "mg/dL", normalRange: "<150" },
        ],
    },
    {
        id: "LAB005", patient_name: "Vikram Desai", patient_id: "P005", doctor: "Dr. Singh",
        test_name: "Urine Analysis", test_type: "Urine Test", date: "2024-12-14",
        status: "Complete", result: "Normal",
        interpretation: "Normal urine analysis. No signs of infection or abnormality.",
        values: [
            { name: "pH", result: "6.0", unit: "", normalRange: "4.5-8.0" },
            { name: "Protein", result: "Negative", unit: "", normalRange: "Negative" },
            { name: "Glucose", result: "Negative", unit: "", normalRange: "Negative" },
        ],
    },
]

// ─── Prescriptions ───────────────────────────────────────────
const prescriptions = [
    { id: "RX001", patient_name: "Rajesh Kumar", patient_id: "P001", medications: [{ medication: "Ibuprofen 400mg", dosage: "1 tablet twice daily", quantity: 30 }], issued: "2024-12-15", status: "Active", doctor_name: "Dr. Sharma", doctor_id: "DR001", instructions: "Take with food. Avoid on empty stomach." },
    { id: "RX002", patient_name: "Priya Nair", patient_id: "P002", medications: [{ medication: "Muscle Relaxant", dosage: "1 tablet at night", quantity: 15 }], issued: "2024-12-18", status: "Filled", doctor_name: "Dr. Singh", doctor_id: "DR002", instructions: "Do not operate heavy machinery." },
    { id: "RX003", patient_name: "Arjun Patel", patient_id: "P003", medications: [{ medication: "Physical Therapy Cream", dosage: "Apply 3 times daily", quantity: 1 }], issued: "2024-12-19", status: "Active", doctor_name: "Dr. Verma", doctor_id: "DR003", instructions: "Apply to affected area and massage gently." },
    { id: "RX004", patient_name: "Meera Gupta", patient_id: "P004", medications: [{ medication: "Vitamin D3 1000IU", dosage: "1 tablet daily", quantity: 60 }], issued: "2024-12-20", status: "Filled", doctor_name: "Dr. Sharma", doctor_id: "DR001", instructions: "Take after breakfast." },
    { id: "RX005", patient_name: "Vikram Desai", patient_id: "P005", medications: [{ medication: "Paracetamol 500mg", dosage: "1-2 tablets as needed", quantity: 20 }], issued: "2024-12-14", status: "Active", doctor_name: "Dr. Singh", doctor_id: "DR002", instructions: "Do not exceed 8 tablets per day." },
]

// ─── Medical Records ─────────────────────────────────────────
const medicalRecords = [
    { id: "MR001", patient_name: "Rajesh Kumar", patient_id: "P001", record_type: "Medical History", date: "2024-12-15", doctor: "Dr. Sharma", status: "Active", summary: "58-year-old male with Knee Osteoarthritis. Presents with chronic knee pain, swelling, and stiffness. Moderate degenerative changes noted on imaging. Treatment plan includes physical therapy and anti-inflammatory medications." },
    { id: "MR002", patient_name: "Priya Nair", patient_id: "P002", record_type: "Surgical Report", date: "2024-12-18", doctor: "Dr. Singh", status: "Active", summary: "42-year-old female with Lumbar Disc Herniation. MRI shows posterolateral disc herniation at L4-L5 with neural compression. Pre-operative assessment completed. Microdiscectomy recommended." },
    { id: "MR003", patient_name: "Arjun Patel", patient_id: "P003", record_type: "Discharge Summary", date: "2024-12-19", doctor: "Dr. Verma", status: "Active", summary: "35-year-old male with Rotator Cuff Tear. Right shoulder MRI confirms full-thickness rotator cuff tear. Patient discharged with physical therapy protocol and pain management plan." },
    { id: "MR004", patient_name: "Meera Gupta", patient_id: "P004", record_type: "Progress Notes", date: "2024-12-20", doctor: "Dr. Sharma", status: "Active", summary: "67-year-old female with Cervical Spondylosis. CT scan shows degenerative changes with osteophyte formation at C5-C6. Conservative management ongoing with good compliance to physical therapy." },
    { id: "MR005", patient_name: "Vikram Desai", patient_id: "P005", record_type: "Treatment Plan", date: "2024-12-14", doctor: "Dr. Singh", status: "Archived", summary: "45-year-old male with Ankle Fracture. Left ankle Weber B fracture with minimal displacement. Conservative treatment with immobilization and progressive weight-bearing protocol." },
]

// ─── Imaging Studies ─────────────────────────────────────────
const imagingStudies = [
    { id: "IMG001", patient_id: "P002", patient_name: "Priya Nair", study_type: "Lumbar Spine MRI", body_part: "Lumbar Spine", modality: "MRI", date: "2024-12-18", month: "Dec", year: "2024", ai_flag: "Abnormal", doctor: "Dr. Singh", thumbnail: "/lumbar-spine-mri-ortho.jpg" },
    { id: "IMG002", patient_id: "P001", patient_name: "Rajesh Kumar", study_type: "Knee X-Ray (AP & Lateral)", body_part: "Knee", modality: "X-Ray", date: "2024-12-15", month: "Dec", year: "2024", ai_flag: "Normal", doctor: "Dr. Sharma", thumbnail: "/knee-xray-ortho.jpg" },
    { id: "IMG003", patient_id: "P003", patient_name: "Arjun Patel", study_type: "Shoulder X-Ray", body_part: "Shoulder", modality: "X-Ray", date: "2024-12-19", month: "Dec", year: "2024", ai_flag: "Requires Review", doctor: "Dr. Verma", thumbnail: "/shoulder-xray-ortho.jpg" },
    { id: "IMG004", patient_id: "P004", patient_name: "Meera Gupta", study_type: "Cervical Spine CT", body_part: "Cervical Spine", modality: "CT", date: "2024-12-20", month: "Dec", year: "2024", ai_flag: "Abnormal", doctor: "Dr. Sharma", thumbnail: "/cervical-ct-ortho.jpg" },
    { id: "IMG005", patient_id: "P005", patient_name: "Vikram Desai", study_type: "Ankle X-Ray", body_part: "Ankle", modality: "X-Ray", date: "2024-12-14", month: "Dec", year: "2024", ai_flag: "Normal", doctor: "Dr. Singh", thumbnail: "/ankle-xray-ortho.jpg" },
    { id: "IMG006", patient_id: "P002", patient_name: "Priya Nair", study_type: "Hip Ultrasound", body_part: "Hip", modality: "Ultrasound", date: "2024-11-28", month: "Nov", year: "2024", ai_flag: "Normal", doctor: "Dr. Singh", thumbnail: "/hip-ultrasound-ortho.jpg" },
]

// ─── Doctors & Specialties ───────────────────────────────────
const specialties = [
    { id: "SPEC-001", name: "Orthopedics", description: "Musculoskeletal system disorders and injuries" },
    { id: "SPEC-002", name: "Neurology", description: "Nervous system disorders" },
    { id: "SPEC-003", name: "Cardiology", description: "Heart and cardiovascular system" },
    { id: "SPEC-004", name: "General", description: "General medicine" },
]

const doctors = [
    { id: "DR001", name: "Dr. Sharma", specialty_id: "SPEC-001", phone: "+91-9876540001", email: "sharma@clinic.com" },
    { id: "DR002", name: "Dr. Singh", specialty_id: "SPEC-001", phone: "+91-9876540002", email: "singh@clinic.com" },
    { id: "DR003", name: "Dr. Verma", specialty_id: "SPEC-001", phone: "+91-9876540003", email: "verma@clinic.com" },
]

// ─── Users ───────────────────────────────────────────────────
async function buildUsers() {
    const hashedPassword = await bcrypt.hash("admin123", 12)
    return [
        { name: "Admin User", email: "admin@clinic.com", password: hashedPassword, role: "ADMIN" as const },
        { name: "Dr. Sharma", email: "sharma@clinic.com", password: hashedPassword, role: "DOCTOR" as const },
        { name: "Staff User", email: "staff@clinic.com", password: hashedPassword, role: "STAFF" as const },
    ]
}

// ─── Helper to map camelCase patient fields to snake_case ────
function mapPatients(patients: any[]) {
    return patients.map((p) => ({
        id: p.id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        phone: p.phone,
        diagnosis: p.diagnosis,
        doctor: p.doctor,
        last_visit: p.lastVisit,
        report_type: p.reportType,
        year: p.year,
        month: p.month,
        laterality: p.laterality,
        severity: p.severity,
        injury_date: p.injuryDate,
        surgery_required: p.surgeryRequired,
        physical_therapy: p.physicalTherapy,
        address: p.address,
        guardian_name: p.guardianName,
        created_by: p.createdBy,
    }))
}

function mapReports(reports: any[]) {
    return reports.map((r) => ({
        id: r.id,
        patient_id: r.patientId,
        type: r.type,
        name: r.name,
        date: r.date,
        path: r.path,
    }))
}

function mapSearchResults(results: any[]) {
    return results.map((s) => ({
        id: s.id,
        patient_name: s.patientName,
        patient_id: s.patientId,
        document_type: s.documentType,
        diagnosis: s.diagnosis,
        date: s.date,
        path: s.path,
        ai_category: s.aiCategory,
        extracted_fields: s.extractedFields,
        ai_terms: s.aiTerms,
        confidence: s.confidence,
    }))
}

async function seed() {
    console.log("🌱 Starting Supabase seed...")

    // 1. Clear existing data
    const tables = [
        "search_results", "imagingstudies", "medicalrecords", "prescriptions",
        "labresults", "reports", "diagnoses", "appointments", "patients",
        "invoices", "opd", "specialties", "doctors", "users"
    ]
    for (const table of tables) {
        const { error } = await supabase.from(table).delete().neq("id", "___never___")
        if (error && !error.message.includes("does not exist")) {
            console.warn(`⚠ Could not clear ${table}:`, error.message)
        }
    }
    // Clear tables with non-text PK (bigserial)
    await supabase.from("diagnoses").delete().gt("id", 0)
    await supabase.from("opd").delete().gt("id", 0)
    console.log("✓ Cleared existing data")

    // 2. Specialties
    const { error: specErr } = await supabase.from("specialties").insert(specialties)
    if (specErr) console.error("specialties:", specErr.message)
    else console.log(`✓ Seeded ${specialties.length} specialties`)

    // 3. Doctors
    const { error: docErr } = await supabase.from("doctors").insert(doctors)
    if (docErr) console.error("doctors:", docErr.message)
    else console.log(`✓ Seeded ${doctors.length} doctors`)

    // 4. Users
    const users = await buildUsers()
    const { error: userErr } = await supabase.from("users").insert(users)
    if (userErr) console.error("users:", userErr.message)
    else console.log(`✓ Seeded ${users.length} users`)

    // 5. Patients
    const { error: patErr } = await supabase.from("patients").insert(mapPatients(mockPatients))
    if (patErr) console.error("patients:", patErr.message)
    else console.log(`✓ Seeded ${mockPatients.length} patients`)

    // 6. Appointments
    const { error: aptErr } = await supabase.from("appointments").insert(appointments)
    if (aptErr) console.error("appointments:", aptErr.message)
    else console.log(`✓ Seeded ${appointments.length} appointments`)

    // 7. Lab Results
    const { error: labErr } = await supabase.from("labresults").insert(labResults)
    if (labErr) console.error("labresults:", labErr.message)
    else console.log(`✓ Seeded ${labResults.length} lab results`)

    // 8. Prescriptions
    const { error: rxErr } = await supabase.from("prescriptions").insert(prescriptions)
    if (rxErr) console.error("prescriptions:", rxErr.message)
    else console.log(`✓ Seeded ${prescriptions.length} prescriptions`)

    // 9. Medical Records
    const { error: mrErr } = await supabase.from("medicalrecords").insert(medicalRecords)
    if (mrErr) console.error("medicalrecords:", mrErr.message)
    else console.log(`✓ Seeded ${medicalRecords.length} medical records`)

    // 10. Imaging Studies
    const { error: imgErr } = await supabase.from("imagingstudies").insert(imagingStudies)
    if (imgErr) console.error("imagingstudies:", imgErr.message)
    else console.log(`✓ Seeded ${imagingStudies.length} imaging studies`)

    // 11. Diagnoses
    const { error: diagErr } = await supabase.from("diagnoses").insert(diagnosisData)
    if (diagErr) console.error("diagnoses:", diagErr.message)
    else console.log(`✓ Seeded ${diagnosisData.length} diagnoses`)

    // 12. Reports
    const { error: repErr } = await supabase.from("reports").insert(mapReports(mockReports))
    if (repErr) console.error("reports:", repErr.message)
    else console.log(`✓ Seeded ${mockReports.length} reports`)

    // 13. Search Results
    const { error: srErr } = await supabase.from("search_results").insert(mapSearchResults(extendedSearchResults))
    if (srErr) console.error("search_results:", srErr.message)
    else console.log(`✓ Seeded ${extendedSearchResults.length} search results`)

    console.log("\n🎉 Supabase seeding complete!")
    console.log("\nDefault login credentials (all users):")
    console.log("  admin@clinic.com  / admin123  (ADMIN)")
    console.log("  sharma@clinic.com / admin123  (DOCTOR)")
    console.log("  staff@clinic.com  / admin123  (STAFF)")
    process.exit(0)
}

seed().catch((err) => {
    console.error("❌ Seeding failed:", err)
    process.exit(1)
})

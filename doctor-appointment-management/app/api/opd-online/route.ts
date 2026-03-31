import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const OPD_API_KEY = process.env.OPD_API_KEY || "pgf-opd-key-2026"

function validateApiKey(request: Request): boolean {
    const key = request.headers.get("x-api-key")
    return key === OPD_API_KEY
}

/**
 * POST /api/opd-online
 * ─────────────────────────────────────────────────────────────────────────────
 * Public endpoint for online OPD booking from the PGF app.
 * Automatically creates:
 * 1. A Patient record (if not exists)
 * 2. An OPD Registration record
 * 3. An Appointment record
 */
export async function POST(request: Request) {
    try {
        if (!validateApiKey(request)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const {
            patientName,
            citizenId, // Unique Citizen Card Number
            phone,
            doctorId,
            date,   // YYYY-MM-DD
            time,   // e.g. "10:00 AM"
            notes,
            age,    // Mandatory for hospital patient record
            gender, // Mandatory for hospital patient record
            address,
            guardianName,
            doctorName, // Name of the doctor selected in the app
            specialty,  // Specialty of the doctor selected in the app
            medicalReports = [], // Array of URLs
            prescriptions = [], // Array of URLs
            imaging = [], // Array of URLs
        } = body

        if (!patientName || !date || !time || !citizenId) {
            return NextResponse.json(
                { error: "patientName, date, time, and citizenId are required." },
                { status: 400 }
            )
        }

        // ── RESOLVE DOCTOR INFO ──────────────────────────────────────────────
        // Use values from the app as defaults, then try to refine with a DB lookup
        let consultantName = doctorName || "General Physician"
        let specialtyName = specialty || "General"

        if (doctorId) {
            const { data: doc } = await supabase
                .from("doctors")
                .select("name, specialty_id")
                .eq("id", doctorId)
                .single()
            
            if (doc) {
                consultantName = doc.name;
                // If the app didn't send a specialty name, we try to fetch it from the ID
                if (!specialtyName || specialtyName === "General") {
                    const { data: spec } = await supabase
                        .from("specialties")
                        .select("name")
                        .eq("id", doc.specialty_id)
                        .single()
                    if (spec) specialtyName = spec.name
                }
            }
        }

        // 1. ── PATIENT SYNC ──────────────────────────────────────────────────
        let finalUhid = ""
        
        // Check for existing patient by citizen card ID
        const { data: existingPatientByCC } = await supabase
            .from("patients")
            .select("id, name")
            .eq("unique_citizen_card_number", citizenId)
            .single()

        if (existingPatientByCC) {
            finalUhid = existingPatientByCC.id
        } else {
            // Check by name and phone as fallback
            const { data: existingPatientByName } = await supabase
                .from("patients")
                .select("id")
                .eq("name", patientName)
                .eq("phone", phone)
                .single()

            if (existingPatientByName) {
                finalUhid = existingPatientByName.id
                // Update their citizen card number if missing
                await supabase
                    .from("patients")
                    .update({ unique_citizen_card_number: citizenId })
                    .eq("id", finalUhid)
            } else {
                // Create NEW patient
                finalUhid = `P${Math.floor(1000 + Math.random() * 9000).toString()}`
                const now = new Date()
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                
                const { error: pError } = await supabase.from("patients").insert({
                    id: finalUhid,
                    name: patientName,
                    age: parseInt(age) || 0,
                    gender: gender || "Others",
                    phone: phone,
                    address: address || "PGF Area",
                    guardian_name: guardianName || "",
                    unique_citizen_card_number: citizenId,
                    diagnosis: "Online OPD Booking",
                    doctor: consultantName,
                    report_type: "OPD", // <--- Fixed: Provide mandatory report_type field
                    last_visit: date,
                    year: now.getFullYear().toString(),
                    month: months[now.getMonth()],
                })

                if (pError) throw pError
            }
        }

        // 2. ── OPD SYNC ──────────────────────────────────────────────────────
        // Generate OPD sequence for today
        const startOfDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).toISOString()
        const { count } = await supabase
            .from("opd")
            .select("*", { count: "exact", head: true })
            .gte("created_at", startOfDay)

        const sequenceNum = (count || 0) + 1
        const formattedSeq = sequenceNum.toString().padStart(3, '0')
        const visitCode = `P${Math.floor(1000 + Math.random() * 9000).toString()}`
        const opdNo = `${visitCode}-${formattedSeq}`

        const validDate = new Date(date)
        validDate.setDate(validDate.getDate() + 5) // valid for 5 days
        const formatDate = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

        const opdData = {
            uhid_no: finalUhid,
            date: formatDate(new Date(date)),
            token_no: formattedSeq,
            patient_name: patientName,
            age_sex: `${age || "0"} / ${gender || "Others"}`,
            opd_no: opdNo,
            guardian_name: guardianName || "",
            mobile_no: phone,
            valid_upto: formatDate(validDate),
            consultant: consultantName,
            address: address || "PGF Area",
            patient_type: "Online Client",
            unique_citizen_card_number: citizenId,
        }

        const { error: oError } = await supabase.from("opd").insert(opdData)
        if (oError) throw oError

        // 3. ── APPOINTMENT SYNC ──────────────────────────────────────────────
        const apptId = `APT-${Math.floor(10000 + Math.random() * 90000)}`
        const apptData = {
            id: apptId,
            patient_name: patientName,
            patient_id: finalUhid,
            unique_citizen_card_number: citizenId,
            date,
            time,
            doctor: consultantName,
            specialty: specialtyName,
            type: "OPD",
            status: "Scheduled",
            phone: phone || null,
            notes: notes ? `[Online Booking] ${notes}` : "[Online Booking]",
        }

        const { data: finalAppt, error: aError } = await supabase
            .from("appointments")
            .insert(apptData)
            .select()
            .single()

        if (aError) throw aError

        // 4. ── PROCESS DOCUMENTS ─────────────────────────────────────────────
        // Medical Reports (and Prescriptions stored as Medical Records)
        // Note: record_type must be one of: 'Progress Notes', 'Imaging Report', 'Lab Report', 'Prescription' (assuming 'Prescription' is allowed or handled by UI)
        // If 'Prescription' is not allowed by check constraint, we use 'Progress Notes' and rely on the summary for filtering.
        const medicalRecordsToInsert = [
            ...medicalReports.map((url: string) => ({
                id: `MR-${Math.floor(10000 + Math.random() * 90000)}`,
                patient_name: patientName,
                patient_id: finalUhid,
                record_type: "Progress Notes",
                date: date,
                doctor: consultantName,
                status: "Active",
                summary: "Uploaded via PGF app booking (Medical Report)",
                attachment_url: url,
                attachment_type: url.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg"
            })),
            ...prescriptions.map((url: string) => ({
                id: `MR-${Math.floor(10000 + Math.random() * 90000)}`,
                patient_name: patientName,
                patient_id: finalUhid,
                record_type: "Prescription", // We'll try 'Prescription' and handle mapping
                date: date,
                doctor: consultantName,
                status: "Active",
                summary: "Uploaded via PGF app booking (Prescription)",
                attachment_url: url,
                attachment_type: url.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg"
            }))
        ]

        if (medicalRecordsToInsert.length > 0) {
            const { error: mrError } = await supabase.from("medicalrecords").insert(medicalRecordsToInsert)
            if (mrError) {
                console.error("Error inserting medical records:", mrError)
                // Fallback: If 'Prescription' type fails, use 'Progress Notes'
                if (mrError.code === '23514' && mrError.message.includes('record_type')) {
                    const fallbackRecords = medicalRecordsToInsert.map(r => ({...r, record_type: 'Progress Notes'}))
                    await supabase.from("medicalrecords").insert(fallbackRecords)
                }
            }
        }

        // Imaging Studies
        if (imaging.length > 0) {
            const imagingToInsert = imaging.map((url: string) => ({
                id: `IMG-${Math.floor(10000 + Math.random() * 90000)}`,
                patient_id: finalUhid,
                patient_name: patientName,
                study_type: "X-ray",
                body_part: "Various",
                modality: "Other",
                date: date,
                month: new Date(date).toLocaleString('default', { month: 'short' }),
                year: new Date(date).getFullYear().toString(),
                ai_flag: "Normal",
                doctor: consultantName,
                thumbnail: url
            }))
            const { error: imgError } = await supabase.from("imagingstudies").insert(imagingToInsert)
            if (imgError) console.error("Error inserting imaging studies:", imgError)
        }

        return NextResponse.json({
            success: true,
            uhid: finalUhid,
            opdNo: opdNo,
            appointment: finalAppt,
        }, { status: 201 })

    } catch (error: any) {
        console.error("[POST /api/opd-online] Error:", error)
        return NextResponse.json(
            { error: "Booking Failed", details: error?.message },
            { status: 500 }
        )
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const citizenId = searchParams.get("citizenId") || searchParams.get("citizen_id")

        if (!citizenId) return NextResponse.json({ error: "Missing citizenId" }, { status: 400 })

        const { data, error } = await supabase
            .from("appointments")
            .select("*")
            .eq("unique_citizen_card_number", citizenId)
            .order("created_at", { ascending: false })

        if (error) throw error
        return NextResponse.json({ appointments: data || [] })
    } catch (error: any) {
        return NextResponse.json({ error: "Fetch Failed" }, { status: 500 })
    }
}

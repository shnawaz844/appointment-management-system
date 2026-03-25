import "dotenv/config"
import mongoose from "mongoose"
import dbConnect from "../lib/dbConnect"
import Patient from "../lib/models/Patient"
import Report from "../lib/models/Report"
import Diagnosis from "../lib/models/Diagnosis"
import SearchResult from "../lib/models/SearchResult"
import Appointment from "../lib/models/Appointment" // Added Appointment model import
import LabResult from "../lib/models/LabResult"
import Prescription from "../lib/models/Prescription"
import MedicalRecord from "../lib/models/MedicalRecord"
import ImagingStudy from "../lib/models/ImagingStudy"
import { mockPatients, diagnosisData, mockReports, extendedSearchResults } from "../lib/data"

// Added appointments data array
const appointments = [
    {
        id: "APT001",
        patientName: "Rajesh Kumar",
        patientId: "P001",
        date: "2024-12-25",
        time: "10:00 AM",
        doctor: "Dr. Sharma",
        type: "Follow-up",
        status: "Scheduled",
        phone: "+91-9876543210",
    },
    {
        id: "APT002",
        patientName: "Priya Nair",
        patientId: "P002",
        date: "2024-12-26",
        time: "02:30 PM",
        doctor: "Dr. Singh",
        type: "Post-Surgery",
        status: "Scheduled",
        phone: "+91-9876543211",
    },
    {
        id: "APT003",
        patientName: "Arjun Patel",
        patientId: "P003",
        date: "2024-12-27",
        time: "11:15 AM",
        doctor: "Dr. Verma",
        type: "Initial Consultation",
        status: "Confirmed",
        phone: "+91-9876543212",
    },
    {
        id: "APT004",
        patientName: "Meera Gupta",
        patientId: "P004",
        date: "2024-12-28",
        time: "03:45 PM",
        doctor: "Dr. Sharma",
        type: "Check-up",
        status: "Scheduled",
        phone: "+91-9876543213",
    },
]

const labResults = [
    {
        id: "LAB001",
        patientName: "Rajesh Kumar",
        patientId: "P001",
        testName: "Blood Count (CBC)",
        testType: "Blood Test",
        date: "2024-12-20",
        status: "Complete",
        result: "Normal",
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
        id: "LAB002",
        patientName: "Priya Nair",
        patientId: "P002",
        testName: "Metabolic Panel",
        testType: "Blood Test",
        date: "2024-12-21",
        status: "Complete",
        result: "Normal",
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
        id: "LAB003",
        patientName: "Arjun Patel",
        patientId: "P003",
        testName: "Thyroid Function",
        testType: "Blood Test",
        date: "2024-12-22",
        status: "Pending",
        result: "Awaiting",
        interpretation: "Test results pending. Expected completion by 2024-12-23.",
        values: [
            { name: "TSH", result: "Pending", unit: "mIU/L", normalRange: "0.4-4.0" },
            { name: "T3", result: "Pending", unit: "ng/dL", normalRange: "80-200" },
            { name: "T4", result: "Pending", unit: "ng/dL", normalRange: "4.5-12" },
        ],
    },
    {
        id: "LAB004",
        patientName: "Meera Gupta",
        patientId: "P004",
        testName: "Lipid Panel",
        testType: "Blood Test",
        date: "2024-12-19",
        status: "Complete",
        result: "Borderline",
        interpretation: "Borderline high cholesterol and triglycerides. Dietary modifications recommended.",
        values: [
            { name: "Total Cholesterol", result: "220", unit: "mg/dL", normalRange: "<200" },
            { name: "LDL", result: "145", unit: "mg/dL", normalRange: "<100" },
            { name: "HDL", result: "38", unit: "mg/dL", normalRange: ">40" },
            { name: "Triglycerides", result: "180", unit: "mg/dL", normalRange: "<150" },
        ],
    },
    {
        id: "LAB005",
        patientName: "Vikram Desai",
        patientId: "P005",
        testName: "Urine Analysis",
        testType: "Urine Test",
        date: "2024-12-14",
        status: "Complete",
        result: "Normal",
        interpretation: "Normal urine analysis. No signs of infection or abnormality.",
        values: [
            { name: "pH", result: "6.0", unit: "", normalRange: "4.5-8.0" },
            { name: "Protein", result: "Negative", unit: "", normalRange: "Negative" },
            { name: "Glucose", result: "Negative", unit: "", normalRange: "Negative" },
        ],
    },
]

const prescriptions = [
    {
        id: "RX001",
        patientName: "Rajesh Kumar",
        patientId: "P001",
        medication: "Ibuprofen 400mg",
        dosage: "1 tablet twice daily",
        quantity: 30,
        issued: "2024-12-15",
        status: "Active",
        doctor: "Dr. Sharma",
        instructions: "Take with food. Avoid on empty stomach.",
    },
    {
        id: "RX002",
        patientName: "Priya Nair",
        patientId: "P002",
        medication: "Muscle Relaxant",
        dosage: "1 tablet at night",
        quantity: 15,
        issued: "2024-12-18",
        status: "Filled",
        doctor: "Dr. Singh",
        instructions: "Do not operate heavy machinery.",
    },
    {
        id: "RX003",
        patientName: "Arjun Patel",
        patientId: "P003",
        medication: "Physical Therapy Cream",
        dosage: "Apply 3 times daily",
        quantity: 1,
        issued: "2024-12-19",
        status: "Active",
        doctor: "Dr. Verma",
        instructions: "Apply to affected area and massage gently.",
    },
    {
        id: "RX004",
        patientName: "Meera Gupta",
        patientId: "P004",
        medication: "Vitamin D3 1000IU",
        dosage: "1 tablet daily",
        quantity: 60,
        issued: "2024-12-20",
        status: "Filled",
        doctor: "Dr. Sharma",
        instructions: "Take after breakfast.",
    },
    {
        id: "RX005",
        patientName: "Vikram Desai",
        patientId: "P005",
        medication: "Paracetamol 500mg",
        dosage: "1-2 tablets as needed",
        quantity: 20,
        issued: "2024-12-14",
        status: "Active",
        doctor: "Dr. Singh",
        instructions: "Do not exceed 8 tablets per day.",
    },
]

const medicalRecords = [
    {
        id: "MR001",
        patientName: "Rajesh Kumar",
        patientId: "P001",
        recordType: "Medical History",
        date: "2024-12-15",
        doctor: "Dr. Sharma",
        status: "Active",
        summary:
            "58-year-old male with Knee Osteoarthritis. Presents with chronic knee pain, swelling, and stiffness. Moderate degenerative changes noted on imaging. Treatment plan includes physical therapy and anti-inflammatory medications.",
    },
    {
        id: "MR002",
        patientName: "Priya Nair",
        patientId: "P002",
        recordType: "Surgical Report",
        date: "2024-12-18",
        doctor: "Dr. Singh",
        status: "Active",
        summary:
            "42-year-old female with Lumbar Disc Herniation. MRI shows posterolateral disc herniation at L4-L5 with neural compression. Pre-operative assessment completed. Microdiscectomy recommended.",
    },
    {
        id: "MR003",
        patientName: "Arjun Patel",
        patientId: "P003",
        recordType: "Discharge Summary",
        date: "2024-12-19",
        doctor: "Dr. Verma",
        status: "Active",
        summary:
            "35-year-old male with Rotator Cuff Tear. Right shoulder MRI confirms full-thickness rotator cuff tear. Patient discharged with physical therapy protocol and pain management plan.",
    },
    {
        id: "MR004",
        patientName: "Meera Gupta",
        patientId: "P004",
        recordType: "Progress Notes",
        date: "2024-12-20",
        doctor: "Dr. Sharma",
        status: "Active",
        summary:
            "67-year-old female with Cervical Spondylosis. CT scan shows degenerative changes with osteophyte formation at C5-C6. Conservative management ongoing with good compliance to physical therapy.",
    },
    {
        id: "MR005",
        patientName: "Vikram Desai",
        patientId: "P005",
        recordType: "Treatment Plan",
        date: "2024-12-14",
        doctor: "Dr. Singh",
        status: "Archived",
        summary:
            "45-year-old male with Ankle Fracture. Left ankle Weber B fracture with minimal displacement. Conservative treatment with immobilization and progressive weight-bearing protocol.",
    },
]

const imagingStudies = [
    {
        id: "IMG001",
        patientId: "P002",
        patientName: "Priya Nair",
        studyType: "Lumbar Spine MRI",
        bodyPart: "Lumbar Spine",
        modality: "MRI",
        date: "2024-12-18",
        month: "Dec",
        year: "2024",
        aiFlag: "Abnormal",
        thumbnail: "/lumbar-spine-mri-ortho.jpg",
    },
    {
        id: "IMG002",
        patientId: "P001",
        patientName: "Rajesh Kumar",
        studyType: "Knee X-Ray (AP & Lateral)",
        bodyPart: "Knee",
        modality: "X-Ray",
        date: "2024-12-15",
        month: "Dec",
        year: "2024",
        aiFlag: "Normal",
        thumbnail: "/knee-xray-ortho.jpg",
    },
    {
        id: "IMG003",
        patientId: "P003",
        patientName: "Arjun Patel",
        studyType: "Shoulder X-Ray",
        bodyPart: "Shoulder",
        modality: "X-Ray",
        date: "2024-12-19",
        month: "Dec",
        year: "2024",
        aiFlag: "Requires Review",
        thumbnail: "/shoulder-xray-ortho.jpg",
    },
    {
        id: "IMG004",
        patientId: "P004",
        patientName: "Meera Gupta",
        studyType: "Cervical Spine CT",
        bodyPart: "Cervical Spine",
        modality: "CT",
        date: "2024-12-20",
        month: "Dec",
        year: "2024",
        aiFlag: "Abnormal",
        thumbnail: "/cervical-ct-ortho.jpg",
    },
    {
        id: "IMG005",
        patientId: "P005",
        patientName: "Vikram Desai",
        studyType: "Ankle X-Ray",
        bodyPart: "Ankle",
        modality: "X-Ray",
        date: "2024-12-14",
        month: "Dec",
        year: "2024",
        aiFlag: "Normal",
        thumbnail: "/ankle-xray-ortho.jpg",
    },
    {
        id: "IMG006",
        patientId: "P002",
        patientName: "Priya Nair",
        studyType: "Hip Ultrasound",
        bodyPart: "Hip",
        modality: "Ultrasound",
        date: "2024-11-28",
        month: "Nov",
        year: "2024",
        aiFlag: "Normal",
        thumbnail: "/hip-ultrasound-ortho.jpg",
    },
]

async function seed() {
    await dbConnect()

    console.log("Connected to MongoDB")

    // Clear existing data
    await Patient.deleteMany({})
    await Report.deleteMany({})
    await Diagnosis.deleteMany({})
    await SearchResult.deleteMany({})
    await Appointment.deleteMany({})
    await LabResult.deleteMany({})
    await Prescription.deleteMany({})
    await MedicalRecord.deleteMany({})
    await ImagingStudy.deleteMany({})

    console.log("Cleared existing data")

    // Seed patients
    await Patient.insertMany(mockPatients)
    console.log(`Seeded ${mockPatients.length} patients`)

    // Seed reports
    await Report.insertMany(mockReports)
    console.log(`Seeded ${mockReports.length} reports`)

    // Seed diagnoses
    await Diagnosis.insertMany(diagnosisData)
    console.log(`Seeded ${diagnosisData.length} diagnoses`)

    // Seed search results
    await SearchResult.insertMany(extendedSearchResults)
    console.log(`Seeded ${extendedSearchResults.length} search results`)

    // Seed appointments
    await Appointment.insertMany(appointments)
    console.log(`Seeded ${appointments.length} appointments`)

    // Seed lab results
    await LabResult.insertMany(labResults)
    console.log(`Seeded ${labResults.length} lab results`)

    // Seed prescriptions
    await Prescription.insertMany(prescriptions)
    console.log(`Seeded ${prescriptions.length} prescriptions`)

    // Seed medical records
    await MedicalRecord.insertMany(medicalRecords)
    console.log(`Seeded ${medicalRecords.length} medical records`)

    // Seed imaging studies
    await ImagingStudy.insertMany(imagingStudies)
    console.log(`Seeded ${imagingStudies.length} imaging studies`)

    console.log("Seeding complete!")
    process.exit(0)
}

seed().catch((err) => {
    console.error("Error seeding database:", err)
    process.exit(1)
})

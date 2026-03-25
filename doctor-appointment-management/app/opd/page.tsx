"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Printer, Activity, Wind, Search, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export default function OPDPage() {
    const [formData, setFormData] = useState({
        uhidNo: "",
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        tokenNo: "",
        patientName: "",
        ageSex: "",
        opdNo: "",
        guardianName: "",
        mobileNo: "",
        validUpto: "",
        consultant: "",
        address: "",
        patientType: "",
    })

    const [patients, setPatients] = useState<any[]>([])
    const [doctors, setDoctors] = useState<any[]>([])
    const [specialties, setSpecialties] = useState<any[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [openPatient, setOpenPatient] = useState(false)
    const [openConsultant, setOpenConsultant] = useState(false)

    useEffect(() => {
        const fetchInitialData = async () => {
            const now = new Date()
            const validDate = new Date()
            validDate.setDate(now.getDate() + 5)

            const formatDate = (date: Date) => date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

            // Generate date string (YYMMDD)
            const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '')

            try {
                // Fetch next sequence for today
                const seqRes = await fetch("/api/opd/next-sequence")
                const seqData = await seqRes.json()
                const sequenceNum = seqData.sequence || 1
                const formattedSeq = sequenceNum.toString().padStart(3, '0')

                // Distinct visit code for OPD (random 4 digits prefixed with P)
                const visitCode = `P${Math.floor(1000 + Math.random() * 9000).toString()}`
                const generatedOpdNo = `${visitCode}-${formattedSeq}`

                setFormData(prev => ({
                    ...prev,
                    date: formatDate(now),
                    validUpto: formatDate(validDate),
                    opdNo: generatedOpdNo,
                    uhidNo: "" // Keep empty for new patient initially
                }))

                const [patientsRes, doctorsRes, specialtiesRes] = await Promise.all([
                    fetch("/api/patients?all=true"),
                    fetch("/api/doctors"),
                    fetch("/api/specialties")
                ])
                const patientsData = await patientsRes.json()
                const doctorsData = await doctorsRes.json()
                const specialtiesData = await specialtiesRes.json()
                setPatients(Array.isArray(patientsData) ? patientsData : [])
                setDoctors(Array.isArray(doctorsData) ? doctorsData : [])
                setSpecialties(Array.isArray(specialtiesData) ? specialtiesData : [])
            } catch (error) {
                console.error("Failed to fetch initial data:", error)
                toast.error("Failed to load patient or doctor data")
            }
        }

        fetchInitialData()
    }, [])

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.patientName?.trim()) newErrors.patientName = "Patient Name is required"

        if (!formData.mobileNo?.trim()) {
            newErrors.mobileNo = "Mobile Number is required"
        } else {
            const normalized = formData.mobileNo.replace(/^\+91\s?/, "").replace(/\D/g, "")
            if (normalized.length !== 10) {
                newErrors.mobileNo = "Mobile Number must be 10 digits"
            }
        }

        if (!formData.ageSex?.trim()) {
            newErrors.ageSex = "Age / Sex is required"
        } else if (!formData.ageSex.includes('/')) {
            newErrors.ageSex = "Format must be: Age / Gender"
        }

        if (!formData.consultant?.trim()) newErrors.consultant = "Consultant is required"
        if (!formData.address?.trim()) newErrors.address = "Address is required"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handlePrint = async () => {
        if (!validateForm()) {
            toast.error("Please fix the errors in the form before proceeding")
            return
        }

        try {
            setIsSaving(true)

            const now = new Date()
            const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

            // Normalize mobile number for matching
            const normalizedPhone = formData.mobileNo.replace(/^\+91\s?/, "").replace(/\D/g, "")

            // Check if patient exists, if not create one
            let finalUhid = formData.uhidNo

            // Try to find patient by name and normalized phone
            const existingPatient = patients.find((p: any) => {
                const pPhone = p.phone?.replace(/^\+91\s?/, "").replace(/\D/g, "")
                return p.name.toLowerCase() === formData.patientName.toLowerCase() && pPhone === normalizedPhone
            })

            // If a UHID was manually entered, check if it already exists to avoid duplication
            if (finalUhid && !existingPatient) {
                const manualMatch = patients.find(p => p.id === finalUhid)
                if (manualMatch) {
                    toast.info(`Using existing UHID: ${finalUhid}`)
                }
            }

            if (existingPatient) {
                finalUhid = existingPatient.id
                toast.info(`Found existing patient: ${finalUhid}`)
            } else {
                // Create a NEW patient record
                if (!finalUhid) {
                    const newPatientId = `P${Math.floor(1000 + Math.random() * 9000).toString()}`
                    finalUhid = newPatientId
                } else {
                    // If a UHID was manually entered, check if it's already used by someone else
                    const manualMatch = patients.find(p => p.id === finalUhid)
                    if (manualMatch) {
                        toast.error(`UHID ${finalUhid} is already assigned to ${manualMatch.name}`)
                        setIsSaving(false)
                        return
                    }
                }

                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

                const newPatientPayload = {
                    id: finalUhid,
                    name: formData.patientName,
                    age: parseInt(formData.ageSex.split('/')[0].trim()) || 0,
                    gender: formData.ageSex.split('/')[1]?.trim() || "Others",
                    phone: formData.mobileNo,
                    diagnosis: "OPD Consultation",
                    doctor: formData.consultant,
                    lastVisit: today,
                    reportType: "OPD",
                    year: now.getFullYear().toString(),
                    month: months[now.getMonth()],
                    address: formData.address,
                    guardianName: formData.guardianName,
                }

                console.log("Creating new patient:", newPatientPayload)
                const pResponse = await fetch("/api/patients", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newPatientPayload)
                })

                if (!pResponse.ok) {
                    const err = await pResponse.json()
                    throw new Error(err.error || "Failed to create patient record")
                }

                toast.success("New patient record created")

                // Refetch patients to sync state
                const patientsRes = await fetch("/api/patients?all=true")
                if (patientsRes.ok) {
                    const patientsData = await patientsRes.json()
                    setPatients(patientsData)
                }
            }

            // 2. Create OPD Registration
            console.log("Creating OPD registration with UHID:", finalUhid)
            const response = await fetch("/api/opd", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    uhidNo: finalUhid
                })
            })

            if (!response.ok) {
                const err = await response.json()
                throw new Error(err.error || "Failed to save OPD registration")
            }

            // 3. Automatically book appointment
            try {
                const selectedDoctor = doctors.find(d => d.name === formData.consultant)
                const selectedSpecialty = specialties.find(s => s.id === selectedDoctor?.specialtyId)

                const appointmentPayload = {
                    id: `APT-${Math.floor(100000 + Math.random() * 900000)}`,
                    patientName: formData.patientName,
                    patientId: finalUhid,
                    date: today,
                    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                    doctor: formData.consultant,
                    specialty: selectedSpecialty?.name || "General",
                    type: "OPD",
                    status: "Scheduled",
                    phone: formData.mobileNo,
                }

                console.log("Booking appointment:", appointmentPayload)
                const aptResponse = await fetch("/api/appointments", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(appointmentPayload)
                })

                if (aptResponse.ok) {
                    toast.success("Appointment booked automatically")
                } else {
                    const aptErr = await aptResponse.json()
                    console.error("Failed to book appointment:", aptErr)
                    toast.error("OPD saved, but failed to book appointment automatically")
                }
            } catch (aptError) {
                console.error("Error booking appointment:", aptError)
            }

            toast.success("Registration saved successfully")
            setTimeout(() => window.print(), 500)
        } catch (error: any) {
            console.error("Save error:", error)
            toast.error(error.message || "Failed to save registration")
        } finally {
            setIsSaving(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[name]
                return newErrors
            })
        }
    }

    const handlePatientSelect = (patient: any) => {
        setFormData(prev => ({
            ...prev,
            patientName: patient.name,
            uhidNo: "", // Keep empty on selection as per user request
            ageSex: `${patient.age} / ${patient.gender}`,
            mobileNo: patient.phone || prev.mobileNo,
            address: patient.address || prev.address,
            guardianName: patient.guardianName || prev.guardianName,
            consultant: patient.doctor || prev.consultant,
        }))
        setOpenPatient(false)
    }

    const handleConsultantSelect = (doctor: any) => {
        setFormData(prev => ({
            ...prev,
            consultant: doctor.name
        }))
        setOpenConsultant(false)
    }

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24">
            <div className="flex justify-between items-center mb-8 no-print">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                        <Activity className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">OPD Registration</h1>
                        <p className="text-muted-foreground font-semibold">Hospital Management System</p>
                    </div>
                </div>
                <Button
                    onClick={handlePrint}
                    disabled={isSaving}
                    className="rounded-2xl gap-3 px-8 h-12 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all font-bold text-base"
                >
                    {isSaving ? <Activity className="h-5 w-5 animate-spin" /> : <Printer className="h-5 w-5" />}
                    {isSaving ? "Saving..." : "Print Form"}
                </Button>
            </div>

            {/* Input Form UI (Visible on screen) */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-4xl p-8 no-print">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <InputFormGroup label="UHID No." name="uhidNo" value={formData.uhidNo} onChange={handleChange} error={errors.uhidNo} />
                    <InputFormGroup label="Date" name="date" value={formData.date} onChange={handleChange} error={errors.date} />
                    <InputFormGroup label="Token No." name="tokenNo" value={formData.tokenNo} onChange={handleChange} error={errors.tokenNo} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Dynamic Patient Name Selection */}
                    <div className="space-y-2 relative">
                        <label className="text-sm font-bold text-slate-700 ml-1">Patient's Name</label>
                        <Popover open={openPatient} onOpenChange={setOpenPatient}>
                            <PopoverTrigger asChild>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="patientName"
                                        autoComplete="off"
                                        value={formData.patientName}
                                        onChange={(e) => {
                                            handleChange(e)
                                            setOpenPatient(true)
                                        }}
                                        placeholder="Type or select patient..."
                                        className={cn(
                                            "w-full bg-white/50 border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 outline-none transition-all shadow-sm",
                                            errors.patientName ? "border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:ring-primary/20 focus:border-primary"
                                        )}
                                    />
                                    <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 shrink-0 opacity-50 cursor-pointer" onClick={() => setOpenPatient(!openPatient)} />
                                </div>
                            </PopoverTrigger>
                            {errors.patientName && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 uppercase tracking-wider">{errors.patientName}</p>}
                            <PopoverContent
                                className="w-[300px] p-0 shadow-2xl rounded-xl border-slate-100"
                                align="start"
                                onOpenAutoFocus={(e) => e.preventDefault()}
                                onCloseAutoFocus={(e) => e.preventDefault()}
                            >
                                <Command>
                                    <CommandList>
                                        <CommandEmpty>No patient found. You can continue typing.</CommandEmpty>
                                        <CommandGroup>
                                            {patients
                                                .filter((p: any) =>
                                                    p.name.toLowerCase().includes(formData.patientName.toLowerCase()) ||
                                                    p.id.toLowerCase().includes(formData.patientName.toLowerCase()) ||
                                                    (p.phone && p.phone.includes(formData.patientName))
                                                )
                                                .slice(0, 10) // Limit to 10 results for better performance
                                                .map((patient: any) => (
                                                    <CommandItem
                                                        key={patient.id}
                                                        value={`${patient.name} ${patient.id}`}
                                                        onSelect={() => handlePatientSelect(patient)}
                                                        className="cursor-pointer"
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                formData.patientName === patient.name ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        <div className="flex flex-col">
                                                            <span>{patient.name}</span>
                                                            <span className="text-[10px] text-muted-foreground">ID: {patient.id} | Phone: {patient.phone}</span>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <InputFormGroup label="Age / Sex" name="ageSex" value={formData.ageSex} onChange={handleChange} error={errors.ageSex} />
                    <InputFormGroup label="OPD No." name="opdNo" value={formData.opdNo} onChange={handleChange} error={errors.opdNo} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <InputFormGroup label="Guardian Name (S/O, W/O, D/O)" name="guardianName" value={formData.guardianName} onChange={handleChange} error={errors.guardianName} />
                    <InputFormGroup label="Mobile No." name="mobileNo" value={formData.mobileNo} onChange={handleChange} error={errors.mobileNo} />
                    <InputFormGroup label="Valid Upto" name="validUpto" value={formData.validUpto} onChange={handleChange} error={errors.validUpto} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Dynamic Consultant Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Consultant</label>
                        <Popover open={openConsultant} onOpenChange={setOpenConsultant}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openConsultant}
                                    className={cn(
                                        "w-full justify-between bg-white/50 border rounded-xl px-4 py-3 h-auto text-sm font-semibold hover:bg-white/80",
                                        errors.consultant ? "border-red-500" : "border-slate-200"
                                    )}
                                >
                                    {formData.consultant || "Select consultant..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            {errors.consultant && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 uppercase tracking-wider">{errors.consultant}</p>}
                            <PopoverContent className="w-[300px] p-0 shadow-2xl rounded-xl border-slate-100">
                                <Command>
                                    <CommandInput placeholder="Search consultant..." />
                                    <CommandList>
                                        <CommandEmpty>No consultant found.</CommandEmpty>
                                        <CommandGroup>
                                            {doctors.map((doctor) => (
                                                <CommandItem
                                                    key={doctor.id}
                                                    value={doctor.name}
                                                    onSelect={() => handleConsultantSelect(doctor)}
                                                    className="cursor-pointer"
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            formData.consultant === doctor.name ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {doctor.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <InputFormGroup label="Address" name="address" value={formData.address} onChange={handleChange} error={errors.address} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputFormGroup label="Patient Type" name="patientType" value={formData.patientType} onChange={handleChange} error={errors.patientType} />
                </div>
            </div>

            {/* Print-specific layout (Hidden on screen) */}
            <div className="print-area hidden print:block text-black">
                <div className="print-container pt-[35mm] px-[10mm]">
                    <div className="border-t-[1.5pt] border-b-[1.5pt] border-black bg-white py-1">
                        {/* Row 1 */}
                        <div className="grid grid-cols-12 leading-relaxed">
                            <div className="col-span-4 flex items-baseline">
                                <span className="text-[9.5pt] font-black w-[27mm]">UHID No.</span>
                                <span className="text-[9.5pt] font-black">: {formData.uhidNo}</span>
                            </div>
                            <div className="col-span-4 flex items-baseline ml-12">
                                <span className="text-[9.5pt] font-black w-[22mm]">Date</span>
                                <span className="text-[9.5pt] font-black">: {formData.date}</span>
                            </div>
                            <div className="col-span-4 flex items-baseline ml-12">
                                <span className="text-[9.5pt] font-black w-[24mm]">Token No.</span>
                                <span className="text-[9.5pt] font-black">: {formData.tokenNo}</span>
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-12 leading-relaxed">
                            <div className="col-span-4 flex items-baseline">
                                <span className="text-[9.5pt] font-black w-[27mm]">Patient Name</span>
                                <span className="text-[9.5pt] font-black">: {formData.patientName}</span>
                            </div>
                            <div className="col-span-4 flex items-baseline ml-12">
                                <span className="text-[9.5pt] font-black w-[22mm]">Age / Sex</span>
                                <span className="text-[9.5pt] font-black">: {formData.ageSex}</span>
                            </div>
                            <div className="col-span-4 flex items-baseline ml-12">
                                <span className="text-[9.5pt] font-black w-[24mm]">OPD No.</span>
                                <span className="text-[9.5pt] font-black">: {formData.opdNo}</span>
                            </div>
                        </div>

                        {/* Row 3 */}
                        <div className="grid grid-cols-12 leading-relaxed">
                            <div className="col-span-4 flex items-baseline">
                                <span className="text-[9.5pt] font-black w-[27mm]">Guardian Name</span>
                                <span className="text-[9.5pt] font-black">: {formData.guardianName}</span>
                            </div>
                            <div className="col-span-4 flex items-baseline ml-12">
                                <span className="text-[9.5pt] font-black w-[22mm]">Mobile No.</span>
                                <span className="text-[9.5pt] font-black">: {formData.mobileNo}</span>
                            </div>
                            <div className="col-span-4 flex items-baseline ml-12">
                                <span className="text-[9.5pt] font-black w-[24mm]">Valid Upto</span>
                                <span className="text-[9.5pt] font-black">: {formData.validUpto}</span>
                            </div>
                        </div>

                        {/* Row 4 */}
                        <div className="grid grid-cols-12 leading-relaxed">
                            <div className="col-span-4 flex items-baseline">
                                <span className="text-[9.5pt] font-black w-[28mm]">Consultant</span>
                                <span className="text-[9.5pt] font-black">: {formData.consultant}</span>
                            </div>
                            <div className="col-span-8 flex items-baseline ml-12">
                                <span className="text-[9.5pt] font-black w-[22mm]">Address</span>
                                <span className="text-[9.5pt] font-black text-wrap">: {formData.address}</span>
                            </div>
                        </div>

                        {/* Row 5 */}
                        <div className="grid grid-cols-12 leading-relaxed">
                            <div className="col-span-12 flex items-baseline">
                                <span className="text-[9.5pt] font-black w-[27mm]">Patient Type</span>
                                <span className="text-[9.5pt] font-black">: {formData.patientType}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @media screen {
                    .print-area { display: none; }
                }

                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                        background: white;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .print-area {
                        display: block !important;
                        position: relative;
                        width: 210mm; /* A4 width */
                        font-family: 'Courier New', Courier, monospace; /* Monospaced for reliable alignment */
                        font-size: 11pt;
                        color: black !important;
                    }
                    .print-container {
                        position: relative;
                        width: 100%;
                    }
                    .print-row {
                        position: absolute;
                        width: 100%;
                        display: flex;
                    }
                    .print-value {
                        position: absolute;
                        white-space: nowrap;
                    }
                    @page {
                        size: A4;
                        margin: 0;
                    }
                }
            `}</style>
        </div>
    )
}

function InputFormGroup({
    label,
    name,
    value,
    onChange,
    error
}: {
    label: string,
    name: string,
    value: string,
    onChange: (e: any) => void,
    error?: string
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">{label}</label>
            <input
                type="text"
                name={name}
                autoComplete="off"
                value={value}
                onChange={onChange}
                className={cn(
                    "w-full bg-white/50 border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 outline-none transition-all shadow-sm",
                    error ? "border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:ring-primary/20 focus:border-primary"
                )}
            />
            {error && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1 uppercase tracking-wider">{error}</p>}
        </div>
    )
}

function FormField({
    label,
    name,
    value,
    onChange
}: {
    label: string,
    name: string,
    value: string,
    onChange: (e: any) => void
}) {
    return (
        <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
                <label className="text-[11px] font-black whitespace-nowrap print:text-black">
                    {label}
                </label>
                <div className="flex-1 border-b-[1.5px] border-black h-5">
                    <input
                        type="text"
                        name={name}
                        autoComplete="off"
                        value={value}
                        onChange={onChange}
                        className="w-full bg-transparent border-none outline-none text-sm font-bold focus:ring-0 p-0"
                    />
                </div>
            </div>
        </div>
    )
}

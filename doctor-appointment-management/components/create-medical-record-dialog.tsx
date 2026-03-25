"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

interface CreateMedicalRecordDialogProps {
    children: React.ReactNode
    onCreated?: () => void
    preselectedPatientId?: string
}

interface Patient {
    _id: string
    id: string
    name: string
}

interface Doctor {
    _id: string
    id: string
    name: string
}

export function CreateMedicalRecordDialog({ children, onCreated, preselectedPatientId }: CreateMedicalRecordDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [fetchingData, setFetchingData] = useState(false)
    const [patients, setPatients] = useState<Patient[]>([])
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [currentUser, setCurrentUser] = useState<any>(null)

    const [selectedPatientId, setSelectedPatientId] = useState("")
    const [recordType, setRecordType] = useState("")
    const [selectedDoctorName, setSelectedDoctorName] = useState("")
    const [status, setStatus] = useState("Active")
    const [summary, setSummary] = useState("")

    useEffect(() => {
        if (open) {
            const fetchData = async () => {
                setFetchingData(true)
                try {
                    const [patientsRes, doctorsRes, authRes] = await Promise.all([
                        fetch("/api/patients"),
                        fetch("/api/doctors"),
                        fetch("/api/auth/me"),
                    ])
                    if (patientsRes.ok) {
                        const pd = await patientsRes.json()
                        setPatients(pd)
                        if (preselectedPatientId) {
                            const matched = pd.find((p: any) => p.id === preselectedPatientId || p._id === preselectedPatientId)
                            if (matched) setSelectedPatientId(matched.id)
                        }
                    }

                    let fetchedDoctors: Doctor[] = []
                    if (doctorsRes.ok) {
                        fetchedDoctors = await doctorsRes.json()
                        setDoctors(fetchedDoctors)
                    }

                    if (authRes.ok) {
                        const authData = await authRes.json()
                        setCurrentUser(authData.user)
                        if (authData.user.role === "DOCTOR") {
                            // The name from user matches Doctor name
                            const doc = fetchedDoctors.find(d => d.name === authData.user.name)
                            if (doc) {
                                setSelectedDoctorName(doc.name)
                            } else {
                                // fallback
                                setSelectedDoctorName(authData.user.name)
                            }
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch data:", error)
                } finally {
                    setFetchingData(false)
                }
            }
            fetchData()
        }
    }, [open])

    const resetForm = () => {
        setSelectedPatientId("")
        setRecordType("")
        if (currentUser?.role !== "DOCTOR") {
            setSelectedDoctorName("")
        }
        setStatus("Active")
        setSummary("")
    }

    const handleSubmit = async () => {
        const patient = patients.find((p) => p.id === selectedPatientId)
        if (!patient || !recordType || !selectedDoctorName || !summary) return

        setLoading(true)
        try {
            const res = await fetch("/api/medical-records", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientName: patient.name,
                    patientId: patient.id,
                    recordType,
                    doctor: selectedDoctorName,
                    status,
                    summary,
                    date: new Date().toISOString().split("T")[0],
                }),
            })
            if (res.ok) {
                setOpen(false)
                resetForm()
                onCreated?.()
            }
        } catch (error) {
            console.error("Failed to create medical record:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl p-0">
                <DialogHeader className="px-8 pt-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">Create Medical Record</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 p-8">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Patient Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="patient" className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Patient *</Label>
                                <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                                    <SelectTrigger id="patient" className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                        <SelectValue placeholder={fetchingData ? "Loading..." : "Select patient"} />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {patients.map((p) => (
                                            <SelectItem key={p._id} value={p.id}>
                                                {p.name} ({p.id})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="patientId" className="text-xs font-bold text-slate-700 dark:text-slate-300">Patient ID</Label>
                                <Input id="patientId" value={selectedPatientId} readOnly className="h-11 rounded-xl bg-muted/50 border-slate-200 dark:border-slate-800" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Record Information</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="recordType" className="text-xs font-bold text-slate-700 dark:text-slate-300">Record Type *</Label>
                                <Select value={recordType} onValueChange={setRecordType}>
                                    <SelectTrigger id="recordType" className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="Medical History">Medical History</SelectItem>
                                        <SelectItem value="Surgical Report">Surgical Report</SelectItem>
                                        <SelectItem value="Discharge Summary">Discharge Summary</SelectItem>
                                        <SelectItem value="Progress Notes">Progress Notes</SelectItem>
                                        <SelectItem value="Treatment Plan">Treatment Plan</SelectItem>
                                        <SelectItem value="Lab Report">Lab Report</SelectItem>
                                        <SelectItem value="Imaging Report">Imaging Report</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-xs font-bold text-slate-700 dark:text-slate-300">Status *</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger id="status" className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {currentUser?.role !== "DOCTOR" && (
                            <div className="space-y-2">
                                <Label htmlFor="doctor" className="text-xs font-bold text-slate-700 dark:text-slate-300">Assign Doctor *</Label>
                                <Select value={selectedDoctorName} onValueChange={setSelectedDoctorName}>
                                    <SelectTrigger id="doctor" className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                        <SelectValue placeholder={fetchingData ? "Loading..." : "Select doctor"} />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {doctors.map((d) => (
                                            <SelectItem key={d._id} value={d.name}>
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="summary" className="text-xs font-bold text-slate-700 dark:text-slate-300">Clinical Summary *</Label>
                            <Textarea
                                id="summary"
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                placeholder="Describe the patient condition, findings, and treatment plan..."
                                rows={4}
                                className="rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                            />
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 justify-end px-8 pb-8 pt-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 rounded-b-3xl">
                    <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl h-11 px-6 font-bold">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !selectedPatientId || !recordType || !selectedDoctorName || !summary}
                        className="rounded-xl h-11 px-6 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? "Creating..." : "Create Record"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

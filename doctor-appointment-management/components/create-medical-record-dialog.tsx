"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ClipboardList, User, Activity, FileText, ChevronRight, AlertCircle, Stethoscope } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface CreateMedicalRecordDialogProps {
    children: React.ReactNode
    onCreated?: () => void
    preselectedPatientId?: string
}

interface Patient {
    id: string
    name: string
}

interface Doctor {
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
    const router = useRouter()

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
                router.refresh()
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
            <DialogContent className="max-w-3xl h-[90vh] bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-slate-200/50 dark:border-white/10 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] rounded-[2.5rem] p-0 overflow-hidden border">
                <DialogHeader className="px-8 pt-8 pb-6 bg-linear-to-r from-blue-600/10 via-transparent to-indigo-600/10 border-b border-slate-100 dark:border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16 rounded-full" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 blur-3xl -ml-12 -mb-12 rounded-full" />
                    <div className="flex items-center gap-4 relative">
                        <div className="p-3 bg-[#e05d38] rounded-2xl shadow-lg shadow-blue-500/20 text-white">
                            <ClipboardList className="w-6 h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">New Medical Record</DialogTitle>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">Create a clinical entry for the patient</p>
                        </div>
                    </div>
                </DialogHeader>

                {fetchingData ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-100 dark:border-blue-900/30 rounded-full animate-pulse" />
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 absolute top-4 left-4" />
                        </div>
                        <p className="font-bold text-slate-400 animate-pulse uppercase tracking-[0.2em] text-[10px]">Synchronizing Clinical Data...</p>
                    </div>
                ) : (
                    <div className="flex flex-col h-[calc(90vh-160px)]">
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-8"
                            >
                                {/* Patient & Doctor Context */}
                                <div className="group bg-white/50 dark:bg-slate-900/40 p-6 rounded-4xl border border-slate-200/60 dark:border-white/5 hover:border-blue-500/30 transition-all duration-300 shadow-sm hover:shadow-md">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-widest">Clinical Context</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2.5">
                                            <Label htmlFor="patient" className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                SELECT PATIENT <span className="text-rose-500">*</span>
                                            </Label>
                                            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                                                <SelectTrigger id="patient" className="h-12 rounded-2xl bg-white/50 dark:bg-slate-950/50 border-slate-200/60 dark:border-white/5 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all">
                                                    <SelectValue placeholder="Select patient" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-slate-200/60 dark:border-white/10 backdrop-blur-xl">
                                                    {patients.map((p) => (
                                                        <SelectItem key={p.id} value={p.id} className="rounded-xl">
                                                            {p.name} ({p.id})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2.5">
                                            <Label htmlFor="doctor" className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                ATTENDING DOCTOR <span className="text-rose-500">*</span>
                                            </Label>
                                            <Select
                                                value={selectedDoctorName}
                                                onValueChange={setSelectedDoctorName}
                                                disabled={currentUser?.role === "DOCTOR"}
                                            >
                                                <SelectTrigger id="doctor" className="h-12 rounded-2xl bg-white/50 dark:bg-slate-950/50 border-slate-200/60 dark:border-white/5 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all">
                                                    <SelectValue placeholder="Select doctor" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-slate-200/60 dark:border-white/10 backdrop-blur-xl">
                                                    {doctors.map((d) => (
                                                        <SelectItem key={d.id} value={d.name} className="rounded-xl">
                                                            <div className="flex items-center gap-2">
                                                                <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                                                                <span>{d.name}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Record Details */}
                                <div className="group bg-white/50 dark:bg-slate-900/40 p-6 rounded-4xl border border-slate-200/60 dark:border-white/5 hover:border-indigo-500/30 transition-all duration-300 shadow-sm hover:shadow-md">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                            <Activity className="w-4 h-4" />
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 uppercase tracking-widest">Record Information</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2.5">
                                            <Label htmlFor="recordType" className="text-xs font-bold text-slate-500 dark:text-slate-400">RECORD TYPE <span className="text-rose-500">*</span></Label>
                                            <Select value={recordType} onValueChange={setRecordType}>
                                                <SelectTrigger id="recordType" className="h-12 rounded-2xl bg-white/50 dark:bg-slate-950/50 border-slate-200/60 dark:border-white/5">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl backdrop-blur-xl">
                                                    {["Medical History", "Surgical Report", "Discharge Summary", "Progress Notes", "Treatment Plan", "Lab Report", "Imaging Report", "Other"].map(type => (
                                                        <SelectItem key={type} value={type} className="rounded-xl">{type}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2.5">
                                            <Label htmlFor="status" className="text-xs font-bold text-slate-500 dark:text-slate-400">STATUS <span className="text-rose-500">*</span></Label>
                                            <Select value={status} onValueChange={setStatus}>
                                                <SelectTrigger id="status" className="h-12 rounded-2xl bg-white/50 dark:bg-slate-950/50 border-slate-200/60 dark:border-white/5">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl backdrop-blur-xl">
                                                    <SelectItem value="Active" className="rounded-xl">Active</SelectItem>
                                                    <SelectItem value="Archived" className="rounded-xl">Archived</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="mt-8 space-y-2.5">
                                        <Label htmlFor="clinicalSummary" className="text-xs font-bold text-slate-500 dark:text-slate-400">CLINICAL SUMMARY <span className="text-rose-500">*</span></Label>
                                        <Textarea
                                            id="clinicalSummary"
                                            value={summary}
                                            onChange={(e) => setSummary(e.target.value)}
                                            placeholder="Describe the patient condition, findings, and treatment plan..."
                                            className="min-h-[160px] rounded-3xl bg-white/50 dark:bg-slate-950/50 border-slate-200/60 dark:border-white/5 focus:ring-[#e05d38]/20 focus:border-[#e05d38]/50 transition-all p-4 resize-none"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <div className="flex gap-4 justify-end px-8 py-5 bg-white/50 dark:bg-slate-900/60 backdrop-blur-xl border-t border-slate-100 dark:border-white/5 items-center">
                            <Button
                                variant="ghost"
                                onClick={() => setOpen(false)}
                                className="rounded-2xl h-12 px-6 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={loading || !selectedPatientId || !recordType || (currentUser?.role !== "DOCTOR" && !selectedDoctorName) || !summary}
                                className="rounded-2xl h-12 px-8 font-extrabold bg-linear-to-r from-[#e05d38] to-[#e05d38] hover:from-[#e05d38] hover:to-[#e05d38] text-white shadow-[0_10px_20px_-10px_rgba(37,99,235,0.4)] hover:shadow-[0_15px_30px_-10px_rgba(37,99,235,0.5)] transition-all duration-300 flex items-center gap-2 min-w-[180px]"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    <>
                                        <span>Save Clinical Record</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

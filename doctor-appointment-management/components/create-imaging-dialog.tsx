"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
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

interface Patient {
    _id: string
    id: string
    name: string
    doctor?: string
}

interface Doctor {
    _id: string
    id: string
    name: string
}

interface CreateImagingDialogProps {
    children: React.ReactNode
    onCreated?: () => void
}

export function CreateImagingDialog({ children, onCreated }: CreateImagingDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [patientName, setPatientName] = useState("")
    const [patientId, setPatientId] = useState("")
    const [studyType, setStudyType] = useState("")
    const [bodyPart, setBodyPart] = useState("")
    const [modality, setModality] = useState("")
    const [date, setDate] = useState(new Date().toISOString().split("T")[0])
    const [aiFlag, setAiFlag] = useState("Normal")
    const [doctor, setDoctor] = useState("")
    const [thumbnail, setThumbnail] = useState<string>("")

    const [patients, setPatients] = useState<Patient[]>([])
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [loadingData, setLoadingData] = useState(false)
    const [comboOpen, setComboOpen] = useState(false)

    useEffect(() => {
        if (!open) return
        const fetchData = async () => {
            setLoadingData(true)
            try {
                const [patientsRes, doctorsRes] = await Promise.all([
                    fetch("/api/patients"),
                    fetch("/api/doctors")
                ])
                if (patientsRes.ok) setPatients(await patientsRes.json())
                if (doctorsRes.ok) setDoctors(await doctorsRes.json())
            } catch (error) {
                console.error("Failed to fetch patients or doctors:", error)
            } finally {
                setLoadingData(false)
            }
        }
        fetchData()
    }, [open])

    const resetForm = () => {
        setPatientName("")
        setPatientId("")
        setStudyType("")
        setBodyPart("")
        setModality("")
        setDate(new Date().toISOString().split("T")[0])
        setAiFlag("Normal")
        setDoctor("")
        setThumbnail("")
    }

    const handleSubmit = async () => {
        if (!patientName || !patientId || !studyType || !bodyPart || !modality) return
        setLoading(true)
        try {
            const res = await fetch("/api/imaging", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientName,
                    patientId,
                    studyType,
                    bodyPart,
                    modality,
                    date,
                    aiFlag,
                    doctor,
                    thumbnail,
                }),
            })
            if (res.ok) {
                setOpen(false)
                resetForm()
                onCreated?.()
            }
        } catch (error) {
            console.error("Failed to create imaging study:", error)
        } finally {
            setLoading(false)
        }
    }
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setThumbnail(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl p-0">
                <DialogHeader className="px-8 pt-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">Add Imaging Study</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 p-8">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Patient Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="patientName" className="text-xs font-bold text-slate-700 dark:text-slate-300">Patient Name *</Label>
                                <Select
                                    value={patientName}
                                    onValueChange={(value) => {
                                        setPatientName(value)
                                        const patient = patients.find((p) => p.name === value)
                                        if (patient) {
                                            setPatientId(patient.id || patient._id)
                                            if (patient.doctor) {
                                                setDoctor(patient.doctor)
                                            }
                                        }
                                    }}
                                    disabled={loadingData}
                                >
                                    <SelectTrigger id="patientName" className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                        <SelectValue placeholder={loadingData ? "Loading..." : "Select patient"} />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {patients.map((p) => (
                                            <SelectItem key={p.id || p._id} value={p.name}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="patientId" className="text-xs font-bold text-slate-700 dark:text-slate-300">Patient ID</Label>
                                <Input
                                    id="patientId"
                                    value={patientId}
                                    readOnly
                                    className="h-11 rounded-xl bg-muted/50 border-slate-200 dark:border-slate-800"
                                    placeholder="Auto-populated"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Study Information</h4>
                        <div className="space-y-2">
                            <Label htmlFor="studyType" className="text-xs font-bold text-slate-700 dark:text-slate-300">Study Type *</Label>
                            <Input
                                id="studyType"
                                value={studyType}
                                onChange={(e) => setStudyType(e.target.value)}
                                placeholder="e.g., Knee X-Ray (AP & Lateral)"
                                className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="bodyPart" className="text-xs font-bold text-slate-700 dark:text-slate-300">Body Part *</Label>
                                <Select value={bodyPart} onValueChange={setBodyPart}>
                                    <SelectTrigger id="bodyPart" className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                        <SelectValue placeholder="Select body part" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="Knee">Knee</SelectItem>
                                        <SelectItem value="Lumbar Spine">Lumbar Spine</SelectItem>
                                        <SelectItem value="Cervical Spine">Cervical Spine</SelectItem>
                                        <SelectItem value="Shoulder">Shoulder</SelectItem>
                                        <SelectItem value="Ankle">Ankle</SelectItem>
                                        <SelectItem value="Hip">Hip</SelectItem>
                                        <SelectItem value="Wrist">Wrist</SelectItem>
                                        <SelectItem value="Elbow">Elbow</SelectItem>
                                        <SelectItem value="Foot">Foot</SelectItem>
                                        <SelectItem value="Thoracic Spine">Thoracic Spine</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="modality" className="text-xs font-bold text-slate-700 dark:text-slate-300">Modality *</Label>
                                <Select value={modality} onValueChange={setModality}>
                                    <SelectTrigger id="modality" className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                        <SelectValue placeholder="Select modality" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="X-Ray">X-Ray</SelectItem>
                                        <SelectItem value="CT">CT Scan</SelectItem>
                                        <SelectItem value="MRI">MRI</SelectItem>
                                        <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date" className="text-xs font-bold text-slate-700 dark:text-slate-300">Study Date *</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="doctor" className="text-xs font-bold text-slate-700 dark:text-slate-300">Assign Doctor *</Label>
                                <Select value={doctor} onValueChange={setDoctor}>
                                    <SelectTrigger id="doctor" className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                        <SelectValue placeholder="Select doctor" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {doctors.map((doc) => (
                                            <SelectItem key={doc._id} value={doc.name}>
                                                {doc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Additional Details</h4>
                        <div className="space-y-2">
                            <Label htmlFor="aiFlag" className="text-xs font-bold text-slate-700 dark:text-slate-300">Analysis Result</Label>
                            <Select value={aiFlag} onValueChange={setAiFlag}>
                                <SelectTrigger id="aiFlag" className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                    <SelectValue placeholder="Select result" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="Normal">Normal</SelectItem>
                                    <SelectItem value="Abnormal">Abnormal</SelectItem>
                                    <SelectItem value="Requires Review">Requires Review</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="imageUpload" className="text-xs font-bold text-slate-700 dark:text-slate-300">Upload Image (Optional)</Label>
                            <Input
                                id="imageUpload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 cursor-pointer file:cursor-pointer p-[0.4rem] file:h-full file:border-0 file:bg-slate-100 file:dark:bg-slate-800 file:text-slate-700 file:dark:text-slate-300 file:rounded-md file:px-3 file:mr-3"
                            />
                            {thumbnail && (
                                <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-2 h-32">
                                    <img src={thumbnail} alt="Preview" className="max-h-full object-contain" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 justify-end px-8 pb-8 pt-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 rounded-b-3xl">
                    <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl h-11 px-6 font-bold">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !patientName || !patientId || !studyType || !bodyPart || !modality || !doctor}
                        className="rounded-xl h-11 px-6 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? "Adding..." : "Add Imaging Study"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

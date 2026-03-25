"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function AddPatientDialog({ children, onSuccess }: { children: React.ReactNode, onSuccess?: () => void }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [doctors, setDoctors] = useState<any[]>([])
  const [specialties, setSpecialties] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    diagnosis: "",
    doctor: "",
    laterality: "",
    severity: "",
    reportType: "X-Ray",
    otherReportType: "",
    reportFile: null as File | null,
  })

  useEffect(() => {
    async function fetchData() {
      setDataLoading(true)
      try {
        const [docRes, specRes, meRes] = await Promise.all([
          fetch("/api/doctors"),
          fetch("/api/specialties"),
          fetch("/api/auth/me")
        ])

        if (docRes.ok) setDoctors(await docRes.json())
        if (specRes.ok) setSpecialties(await specRes.json())
        if (meRes.ok) {
          const meData = await meRes.json()
          setCurrentUser(meData.user)

          // If the logged in user is a doctor, auto-set them
          if (meData.user?.role === "DOCTOR") {
            setFormData(prev => ({ ...prev, doctor: meData.user.name }))
          }
        }
      } catch (error) {
        console.error("Error fetching dialog data:", error)
      } finally {
        setDataLoading(false)
      }
    }

    if (open) {
      fetchData()
    }
  }, [open])

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {}
    if (currentStep === 1) {
      if (!formData.name) newErrors.name = "Full name is required"
      if (!formData.age) newErrors.age = "Age is required"
      if (!formData.gender) newErrors.gender = "Gender is required"
      if (!formData.phone) newErrors.phone = "Phone is required"
    } else if (currentStep === 2) {
      if (!formData.diagnosis) newErrors.diagnosis = "Diagnosis is required"
      if (!formData.doctor) newErrors.doctor = "Doctor is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 3) setStep(step + 1)
    }
  }

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1)
    setErrors({})
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      if (!validateStep(1) || !validateStep(2)) {
        alert("Please complete all required fields in Previous steps.")
        return
      }
    }

    setLoading(true)
    try {
      const now = new Date()
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

      const payload = {
        id: `P${Math.floor(1000 + Math.random() * 9000).toString()}`,
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender,
        phone: formData.phone,
        diagnosis: formData.diagnosis,
        doctor: formData.doctor,
        lastVisit: now.toISOString().split('T')[0],
        reportType: formData.reportType === "Others" ? formData.otherReportType : formData.reportType,
        year: now.getFullYear().toString(),
        month: months[now.getMonth()],
        laterality: formData.laterality || "Right",
        severity: formData.severity || "Mild",
        injuryDate: now.toISOString().split('T')[0],
        surgeryRequired: false,
        physicalTherapy: false,
      }

      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setOpen(false)
        setStep(1)
        setFormData({
          name: "",
          age: "",
          gender: "",
          phone: "",
          email: "",
          diagnosis: "",
          doctor: currentUser?.role === "DOCTOR" ? currentUser.name : "",
          laterality: "",
          severity: "",
          reportType: "X-Ray",
          otherReportType: "",
          reportFile: null,
        })
        setErrors({})
        if (onSuccess) onSuccess()
      } else {
        const error = await response.json()
        alert(`Failed to add patient: ${error.error || JSON.stringify(error)}`)
      }
    } catch (error) {
      console.error("Error adding patient:", error)
      alert("An error occurred while adding the patient")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl p-0">
        <DialogHeader className="px-8 pt-8 pb-4 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">Add New Patient <span className="text-sm font-bold text-slate-400 ml-2 uppercase tracking-widest">Step {step} of 3</span></DialogTitle>
        </DialogHeader>

        {dataLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="font-bold text-muted-foreground animate-pulse uppercase tracking-widest text-xs">Loading Resources...</p>
          </div>
        ) : (
          <div className="p-8 space-y-6">
            {step === 1 && (
              <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className={cn("text-xs font-bold", errors.name ? "text-destructive" : "text-slate-700 dark:text-slate-300")}>Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter full name"
                      className={cn("h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800", errors.name ? "border-destructive animate-shake" : "")}
                    />
                    {errors.name && <p className="text-[10px] font-bold text-destructive uppercase tracking-tight">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age" className={cn("text-xs font-bold", errors.age ? "text-destructive" : "text-slate-700 dark:text-slate-300")}>Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="32"
                      className={cn("h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800", errors.age ? "border-destructive animate-shake" : "")}
                    />
                    {errors.age && <p className="text-[10px] font-bold text-destructive uppercase tracking-tight">{errors.age}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className={cn("text-xs font-bold", errors.gender ? "text-destructive" : "text-slate-700 dark:text-slate-300")}>Gender *</Label>
                    <Select value={formData.gender || undefined} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                      <SelectTrigger id="gender" className={cn("h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800", errors.gender ? "border-destructive animate-shake" : "")}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && <p className="text-[10px] font-bold text-destructive uppercase tracking-tight">{errors.gender}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className={cn("text-xs font-bold", errors.phone ? "text-destructive" : "text-slate-700 dark:text-slate-300")}>Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91-0000000000"
                      className={cn("h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800", errors.phone ? "border-destructive animate-shake" : "")}
                    />
                    {errors.phone && <p className="text-[10px] font-bold text-destructive uppercase tracking-tight">{errors.phone}</p>}
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@email.com"
                      className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Medical Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis" className={cn("text-xs font-bold", errors.diagnosis ? "text-destructive" : "text-slate-700 dark:text-slate-300")}>Diagnosis / Specialty *</Label>
                    <Select value={formData.diagnosis || undefined} onValueChange={(v) => setFormData({ ...formData, diagnosis: v })}>
                      <SelectTrigger id="diagnosis" className={cn("h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800", errors.diagnosis ? "border-destructive animate-shake" : "")}>
                        <SelectValue placeholder="Select diagnosis" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {specialties.length > 0 ? (
                          specialties.map((s) => (
                            <SelectItem key={s.id || s._id} value={s.name}>{s.name}</SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="Knee Osteoarthritis">Knee Osteoarthritis</SelectItem>
                            <SelectItem value="Lumbar Disc Herniation">Lumbar Disc Herniation</SelectItem>
                            <SelectItem value="Rotator Cuff Tear">Rotator Cuff Tear</SelectItem>
                            <SelectItem value="Cervical Spondylosis">Cervical Spondylosis</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.diagnosis && <p className="text-[10px] font-bold text-destructive uppercase tracking-tight">{errors.diagnosis}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor" className={cn("text-xs font-bold", errors.doctor ? "text-destructive" : "text-slate-700 dark:text-slate-300")}>Attending Doctor *</Label>
                    <Select
                      value={formData.doctor || undefined}
                      onValueChange={(v) => setFormData({ ...formData, doctor: v })}
                      disabled={currentUser?.role === "DOCTOR"}
                    >
                      <SelectTrigger id="doctor" className={cn("h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800", errors.doctor ? "border-destructive animate-shake" : "")}>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {doctors.length > 0 ? (
                          doctors.map((d) => (
                            <SelectItem key={d.id || d._id} value={d.name}>{d.name}</SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="Dr. Sharma">Dr. Sharma</SelectItem>
                            <SelectItem value="Dr. Singh">Dr. Singh</SelectItem>
                            <SelectItem value="Dr. Verma">Dr. Verma</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.doctor && <p className="text-[10px] font-bold text-destructive uppercase tracking-tight">{errors.doctor}</p>}
                  </div>
                  {/* <div className="space-y-2">
                    <Label htmlFor="laterality" className="text-xs font-bold text-slate-700 dark:text-slate-300">Laterality</Label>
                    <Select value={formData.laterality || undefined} onValueChange={(v) => setFormData({ ...formData, laterality: v })}>
                      <SelectTrigger id="laterality" className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <SelectValue placeholder="Select side" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Right">Right</SelectItem>
                        <SelectItem value="Left">Left</SelectItem>
                        <SelectItem value="Bilateral">Bilateral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="severity" className="text-xs font-bold text-slate-700 dark:text-slate-300">Severity</Label>
                    <Select value={formData.severity || undefined} onValueChange={(v) => setFormData({ ...formData, severity: v })}>
                      <SelectTrigger id="severity" className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Mild">Mild</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                        <SelectItem value="Severe">Severe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div> */}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Initial Reports (Optional)</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reportType" className="text-xs font-bold text-slate-700 dark:text-slate-300">Report Type</Label>
                    <Select value={formData.reportType || undefined} onValueChange={(v) => setFormData({ ...formData, reportType: v })}>
                      <SelectTrigger id="reportType" className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="X-Ray">X-Ray</SelectItem>
                        <SelectItem value="MRI">MRI</SelectItem>
                        <SelectItem value="CT-Scan">CT-Scan</SelectItem>
                        <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.reportType === "Others" && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label htmlFor="otherReportType" className="text-xs font-bold text-slate-700 dark:text-slate-300">Specify Report Type *</Label>
                      <Input
                        id="otherReportType"
                        value={formData.otherReportType}
                        onChange={(e) => setFormData({ ...formData, otherReportType: e.target.value })}
                        placeholder="Enter report type (e.g. Blood Test)"
                        className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="file" className="text-xs font-bold text-slate-700 dark:text-slate-300">Upload Report</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.jpg,.png,.dcm"
                      onChange={(e) => setFormData({ ...formData, reportFile: e.target.files?.[0] || null })}
                      className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 file:bg-blue-600 file:text-white file:border-none file:rounded-md file:px-3 file:py-1 file:mr-3 file:cursor-pointer hover:file:bg-blue-700 transition-all cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              {step > 1 && (
                <Button variant="outline" onClick={handlePrevious} disabled={loading} className="rounded-xl h-11 px-6 font-bold">
                  Previous
                </Button>
              )}
              {step < 3 ? (
                <Button onClick={handleNext} className="rounded-xl h-11 px-6 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25">
                  Next Step
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading} className="rounded-xl h-11 px-6 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Patient...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

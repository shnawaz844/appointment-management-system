"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface CreateLabResultDialogProps {
  children: React.ReactNode
  onCreated?: () => void
}

export function CreateLabResultDialog({ children, onCreated }: CreateLabResultDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [patientName, setPatientName] = useState("")
  const [patientId, setPatientId] = useState("")
  const [doctorName, setDoctorName] = useState("")
  const [testName, setTestName] = useState("")
  const [testType, setTestType] = useState("")
  const [status, setStatus] = useState("Pending")
  const [result, setResult] = useState("Awaiting")
  const [notes, setNotes] = useState("")
  const [patients, setPatients] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      Promise.all([
        fetch("/api/patients").then((res) => res.json()),
        fetch("/api/doctors").then((res) => res.json())
      ])
        .then(([patientsData, doctorsData]) => {
          if (Array.isArray(patientsData)) setPatients(patientsData)
          if (Array.isArray(doctorsData)) setDoctors(doctorsData)
        })
        .catch(console.error)
    }
  }, [open])

  const handleSubmit = async () => {
    if (!patientName || !patientId || !testName || !doctorName) return
    setLoading(true)
    try {
      const res = await fetch("/api/lab-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName,
          patientId,
          doctor: doctorName,
          testName,
          testType,
          status,
          result,
          interpretation: notes,
          date: new Date().toISOString().split("T")[0],
        }),
      })
      if (res.ok) {
        setOpen(false)
        setPatientName("")
        setPatientId("")
        setDoctorName("")
        setTestName("")
        setTestType("")
        setStatus("Pending")
        setResult("Awaiting")
        setNotes("")
        onCreated?.()
      }
    } catch (error) {
      console.error("Failed to create lab result:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl p-0">
        <DialogHeader className="px-8 pt-8 pb-4 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">Create Lab Result</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 p-8">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Patient Details</h4>
            <div className="space-y-2">
              <Label htmlFor="patientName" className="text-xs font-bold text-slate-700 dark:text-slate-300">Patient *</Label>
              <Select
                value={patientName}
                onValueChange={(val) => {
                  const patient = patients.find((p) => p.name === val)
                  if (patient) {
                    setPatientName(patient.name)
                    setPatientId(patient.id || patient._id || "")
                    setDoctorName(patient.doctor || "") // Auto-fill doctor
                  }
                }}
              >
                <SelectTrigger id="patientName" className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {patients.map((p) => (
                    <SelectItem key={p.id || p._id} value={p.name}>
                      {p.name} (OPD: {p.id || p._id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Test Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="testName" className="text-xs font-bold text-slate-700 dark:text-slate-300">Test Name *</Label>
                <Input
                  id="testName"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="e.g., Complete Blood Count"
                  className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctorName" className="text-xs font-bold text-slate-700 dark:text-slate-300">Attending Doctor *</Label>
                <Select value={doctorName} onValueChange={setDoctorName}>
                  <SelectTrigger id="doctorName" className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {doctors.map((d) => (
                      <SelectItem key={d.id || d._id} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="testType" className="text-xs font-bold text-slate-700 dark:text-slate-300">Test Type</Label>
                <Select value={testType} onValueChange={setTestType}>
                  <SelectTrigger id="testType" className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Blood Test">Blood Test</SelectItem>
                    <SelectItem value="Urine Test">Urine Test</SelectItem>
                    <SelectItem value="X-Ray">X-Ray</SelectItem>
                    <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                    <SelectItem value="ECG">ECG</SelectItem>
                    <SelectItem value="CT Scan">CT Scan</SelectItem>
                    <SelectItem value="MRI">MRI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-xs font-bold text-slate-700 dark:text-slate-300">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status" className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Complete">Complete</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="result" className="text-xs font-bold text-slate-700 dark:text-slate-300">Result</Label>
              <Select value={result} onValueChange={setResult}>
                <SelectTrigger id="result" className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Awaiting">Awaiting</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Borderline">Borderline</SelectItem>
                  <SelectItem value="Abnormal">Abnormal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-xs font-bold text-slate-700 dark:text-slate-300">Notes / Interpretation</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Test findings or observations..."
                rows={3}
                className="rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-end px-8 pb-8 pt-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 rounded-b-3xl">
          <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl h-11 px-6 font-bold">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !patientName || !patientId || !testName || !doctorName} className="rounded-xl h-11 px-6 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25">
            {loading ? "Creating..." : "Create Lab Result"}
          </Button>
        </div>
      </DialogContent>
    </Dialog >
  )
}

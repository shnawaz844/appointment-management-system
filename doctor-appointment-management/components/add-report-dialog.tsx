"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export function AddReportDialog({ patientId, patientName, children }: any) {
  const [open, setOpen] = useState(false)
  const [reportType, setReportType] = useState("")
  const [reportName, setReportName] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = () => {
    console.log("[v0] Adding report:", { patientId, reportType, reportName, notes })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Medical Report for {patientName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger id="reportType">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="X-Ray">X-Ray</SelectItem>
                <SelectItem value="MRI">MRI</SelectItem>
                <SelectItem value="CT-Scan">CT-Scan</SelectItem>
                <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                <SelectItem value="Physical Therapy">Physical Therapy</SelectItem>
                <SelectItem value="Surgical Notes">Surgical Notes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reportName">Report Name</Label>
            <Input
              id="reportName"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="e.g., Knee_XRay_Follow_Up.pdf"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">Upload File</Label>
            <Input id="file" type="file" accept=".pdf,.jpg,.png,.dcm" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Report</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

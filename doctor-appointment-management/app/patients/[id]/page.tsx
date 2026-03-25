import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { User, Phone, Mail, Calendar, FileText, Download, ExternalLink, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { ImagingStudies } from "@/components/imaging-studies"
import Link from "next/link"
import { CreateMedicalRecordDialog } from "@/components/create-medical-record-dialog"
import { CreateAppointmentDialog } from "@/components/create-appointment-dialog"
import { ViewReportDialog } from "@/components/view-report-dialog"
import { CreatePrescriptionDialog } from "@/components/create-prescription-dialog"
import { FileSignature } from "lucide-react"

export default async function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Fetch all data in parallel using Supabase
  const [
    { data: patient },
    { data: patientReportsData },
    { data: patientAppointmentsData },
    { data: patientMedicalRecordsData },
    { data: patientImagingStudiesData }
  ] = await Promise.all([
    supabase.from("patients").select("*").eq("id", id).single(),
    supabase.from("reports").select("*").eq("patient_id", id),
    supabase.from("appointments").select("*").eq("patient_id", id).order("date", { ascending: false }),
    supabase.from("medicalrecords").select("*").eq("patient_id", id).order("created_at", { ascending: false }),
    supabase.from("imagingstudies").select("*").eq("patient_id", id).order("created_at", { ascending: false })
  ])

  const patientReports = patientReportsData || []
  const patientAppointments = patientAppointmentsData || []
  const patientMedicalRecords = patientMedicalRecordsData || []
  const patientImagingStudies = patientImagingStudiesData || []

  if (!patient) {

    return (
      <main className="flex-1">
        <div className="container py-8 px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-foreground mb-2">Patient Not Found</h2>
            <p className="text-muted-foreground mb-4">The patient you're looking for doesn't exist.</p>
            <Link href="/patients">
              <Button>Back to Patients</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // Group reports by type
  const reportsByType = patientReports.reduce(
    (acc: Record<string, any[]>, report: any) => {
      if (!acc[report.type]) {
        acc[report.type] = []
      }
      acc[report.type].push(report)
      return acc
    },
    {} as Record<string, any[]>,
  )

  return (
    <main className="flex-1">
      <div className="container py-8 px-8">
        {/* Back button */}
        <Link href="/patients">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{patient.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline" className="font-mono">
                  {patient.id}
                </Badge>
                <Badge>{patient.diagnosis}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <CreateMedicalRecordDialog preselectedPatientId={patient.id}>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Add Report
                </Button>
              </CreateMedicalRecordDialog>
              <CreatePrescriptionDialog preselectedPatientId={patient.id}>
                <Button variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/40">
                  <FileSignature className="h-4 w-4 mr-2" />
                  Create Prescription
                </Button>
              </CreatePrescriptionDialog>
              <CreateAppointmentDialog preselectedPatientId={patient.id}>
                <Button>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Visit
                </Button>
              </CreateAppointmentDialog>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="visits">Visits & Appointments</TabsTrigger>
            <TabsTrigger value="reports">Medical Reports</TabsTrigger>
            <TabsTrigger value="imaging">Imaging</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Demographics */}
              <Card>
                <CardHeader>
                  <CardTitle>Demographics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p className="text-base font-medium text-foreground">{patient.name}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Age & Gender</p>
                      <p className="text-base font-medium text-foreground">
                        {patient.age} years • {patient.gender}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p className="text-base font-medium text-foreground">{patient.phone}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-base font-medium text-foreground">
                        {patient.name.toLowerCase().replace(" ", ".")}@email.com
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medical Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Medical Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Primary Diagnosis</p>
                    <Badge className="text-sm">{patient.diagnosis}</Badge>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Attending Doctor</p>
                    <p className="text-base font-medium text-foreground">{patient.doctor}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Last Visit</p>
                    <p className="text-base font-medium text-foreground">{patient.last_visit}</p>
                  </div>
                  <Separator />
                  {/* <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Known Allergies</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="destructive">Penicillin</Badge>
                      <Badge variant="destructive">NSAIDs</Badge>
                    </div>
                  </div> */}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Orthopedic Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Side Affected</p>
                    <p className="text-base font-medium text-foreground">{patient.laterality || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Severity</p>
                    <Badge variant="outline">{patient.severity || "Not specified"}</Badge>
                  </div> */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Date of Injury/Onset</p>
                    <p className="text-base font-medium text-foreground">{patient.injury_date || "N/A"}</p>
                  </div>
                  {/* <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Surgery Status</p>
                    <Badge variant={patient.surgeryRequired ? "destructive" : "secondary"}>
                      {patient.surgeryRequired ? "Surgery Required" : "Conservative Treatment"}
                    </Badge>
                  </div> */}
                </div>
                {/* <Separator /> */}
                {/* <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Physical Therapy</p>
                  <Badge variant={patient.physicalTherapy ? "default" : "secondary"}>
                    {patient.physicalTherapy ? "Active" : "Not scheduled"}
                  </Badge>
                </div> */}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visits & Appointments Tab */}
          <TabsContent value="visits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visit History</CardTitle>
                <CardDescription>Past appointments and consultations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patientAppointments.length > 0 ? (
                    patientAppointments.map((apt: any) => (
                      <div key={apt.id} className="flex items-start gap-4 p-4 rounded-lg border border-border group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-foreground">{apt.type} - {apt.specialty}</p>
                            <Badge variant="outline">{apt.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{apt.date} at {apt.time} with {apt.doctor}</p>
                          {apt.notes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {apt.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No visits or appointments found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medical Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Medical Reports</CardTitle>
                <CardDescription>Imaging and diagnostic reports organized by type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {patientMedicalRecords.length > 0 ? (
                  <div className="space-y-2">
                    {patientMedicalRecords.map((record: any) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="h-16 w-16 rounded bg-muted flex items-center justify-center shrink-0">
                            <FileText className="h-8 w-8 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground">{record.record_type}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span>{record.date}</span>
                              <span>•</span>
                              <span>Dr. {record.doctor}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 truncate">{record.summary}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={record.status === "Active" ? "default" : "secondary"}>{record.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No medical records found for this patient</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Imaging Tab */}
          <TabsContent value="imaging" className="space-y-6">
            <ImagingStudies studies={patientImagingStudies} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, User, FileText, Clock } from "lucide-react"

interface ViewMedicalRecordDialogProps {
    record: {
        id: string
        patient_name: string
        patient_id: string
        record_type: string
        date: string
        doctor: string
        status: string
        summary: string
    }
    children: React.ReactNode
}

export function ViewMedicalRecordDialog({ record, children }: ViewMedicalRecordDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl p-0">
                <DialogHeader className="px-8 pt-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">Clinical Detail</DialogTitle>
                            <p className="text-sm font-medium text-slate-500 mt-1">Record #{record.id}</p>
                        </div>
                        <Badge
                            className={
                                record.status === "Active"
                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 px-3 py-1 rounded-full"
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full"
                            }
                        >
                            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${record.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                            {record.status}
                        </Badge>
                    </div>
                </DialogHeader>
                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <User className="h-3 w-3" />
                                Patient Name
                            </div>
                            <p className="font-black text-slate-900 dark:text-white">{record.patient_name}</p>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <FileText className="h-3 w-3" />
                                Record Type
                            </div>
                            <Badge variant="outline" className="font-bold border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                                {record.record_type}
                            </Badge>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <Calendar className="h-3 w-3" />
                                Date
                            </div>
                            <p className="font-bold text-slate-900 dark:text-white">{record.date}</p>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <Clock className="h-3 w-3" />
                                Consulting Doctor
                            </div>
                            <p className="font-bold text-slate-900 dark:text-white">Dr. {record.doctor}</p>
                        </div>
                    </div>

                    <Separator className="bg-slate-100 dark:bg-slate-800" />

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <FileText className="h-3 w-3" />
                            Clinical Summary
                        </div>
                        <div className="p-6 bg-slate-50/80 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium italic">
                                "{record.summary}"
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

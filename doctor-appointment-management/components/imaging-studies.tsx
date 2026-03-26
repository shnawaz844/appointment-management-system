"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"
import { DeleteImagingDialog } from "./delete-imaging-dialog"
import Image from "next/image"

interface ImagingStudiesProps {
  studies?: any[]
}

export function ImagingStudies({ studies = [] }: ImagingStudiesProps) {
  const [selectedImage, setSelectedImage] = useState<any>(null)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Imaging Studies</CardTitle>
          <CardDescription>X-rays, CT scans, MRI, and ultrasound imaging</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {studies.length > 0 ? studies.map((study) => (
              <div key={study.id} className="rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors">
                <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                  <Image src={study.thumbnail || "/placeholder.svg"} alt={study.study_type} fill className="object-cover" />
                </div>
                <p className="font-medium text-foreground">{study.study_type}</p>
                <p className="text-sm text-muted-foreground mt-1">{study.date}</p>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent font-bold"
                    onClick={() => setSelectedImage(study)}
                  >
                    View Image
                  </Button>
                  <DeleteImagingDialog imagingId={study.id} studyType={study.study_type}>
                    <Button variant="ghost" size="sm" className="h-9 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-all px-3">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DeleteImagingDialog>
                </div>
              </div>
            )) : (
              <div className="col-span-3 text-center py-8 text-muted-foreground">
                <p>No imaging studies found for this patient</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{selectedImage.study_type}</DialogTitle>
              <DialogDescription>{selectedImage.findings || "No findings provided."}</DialogDescription>
            </DialogHeader>
            <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
              <Image
                src={selectedImage.thumbnail || "/placeholder.svg"}
                alt={selectedImage.study_type}
                fill
                className="object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

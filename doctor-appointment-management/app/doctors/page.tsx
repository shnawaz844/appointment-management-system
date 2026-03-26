"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, UserPlus } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState<any[]>([])
    const [specialties, setSpecialties] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({ name: "", specialty: "", phone: "", email: "", password: "" })

    const fetchData = async () => {
        try {
            const [docsRes, specsRes] = await Promise.all([
                fetch("/api/doctors"),
                fetch("/api/specialties")
            ])
            const docsData = await docsRes.json()
            const specsData = await specsRes.json()
            setDoctors(Array.isArray(docsData) ? docsData : [])
            setSpecialties(Array.isArray(specsData) ? specsData : [])
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name || !formData.specialty) return
        setSubmitting(true)
        try {
            let specId = specialties.find(s => s.name.toLowerCase() === formData.specialty.trim().toLowerCase())?.id

            if (!specId) {
                const specRes = await fetch("/api/specialties", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: formData.specialty.trim(), description: "Auto-created specialty" })
                })
                const newSpec = await specRes.json()
                specId = newSpec.id
            }

            const res = await fetch("/api/doctors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    specialty_id: specId,
                    phone: formData.phone,
                    email: formData.email,
                    password: formData.password
                }),
            })
            if (res.ok) {
                setFormData({ name: "", specialty: "", phone: "", email: "", password: "" })
                fetchData()
            }
        } catch (error) {
            console.error(error)
        } finally {
            setSubmitting(false)
        }
    }

    const getspecialtyName = (id: string) => {
        return specialties.find(s => s.id === id)?.name || "Unknown"
    }

    return (
        <main className="flex-1">
            <div className="container py-8 px-8">
                <PageHeader title="Doctors" description="Manage medical staff" />

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add New Doctor</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Doctor Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Dr. John Doe"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="specialty">Specialty *</Label>
                                    <Input
                                        id="specialty"
                                        list="specialties-list"
                                        value={formData.specialty}
                                        onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                        placeholder="Type or select specialty"
                                        required
                                    />
                                    <datalist id="specialties-list">
                                        {specialties.map(s => (
                                            <option key={s.id} value={s.name} />
                                        ))}
                                    </datalist>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="Phone number"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="Email address"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Login Password *</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Set password for doctor login"
                                        required
                                    />
                                </div>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                    Add Doctor
                                </Button>

                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Existing Doctors</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <ScrollArea className="h-[400px] pr-4">
                                    <div className="space-y-2">
                                        {doctors.length === 0 ? (
                                            <p className="text-sm text-muted-foreground italic">No doctors found.</p>
                                        ) : (
                                            doctors.map((d) => (
                                                <div key={d.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div>
                                                        <p className="font-medium">{d.name}</p>
                                                        <p className="text-xs text-primary font-semibold">{getspecialtyName(d.specialty_id)}</p>
                                                        <p className="text-xs text-muted-foreground">{d.email || d.phone || "No contact info"}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    )
}

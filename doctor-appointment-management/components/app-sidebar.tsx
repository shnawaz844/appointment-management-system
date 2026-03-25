"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  Search,
  FolderTree,
  FileImage,
  Settings,
  Activity,
  Calendar,
  CreditCard,
  FlaskConical,
  Pill,
  ClipboardList,
  MessageSquare,
  LogOut,
  ShieldCheck,
  BarChart,
  User as UserIcon,
  Mail,
  Building,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ChangePasswordDialog } from "@/components/change-password-dialog"

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    roles: ["ADMIN", "DOCTOR", "STAFF"],
  },
  {
    title: "OPD",
    href: "/opd",
    icon: ClipboardList,
    roles: ["STAFF", "ADMIN"],
  },
  {
    title: "Appointments",
    href: "/appointments",
    icon: Calendar,
    roles: ["ADMIN", "DOCTOR", "STAFF"],
  },
  {
    title: "Patients",
    href: "/patients",
    icon: Users,
    roles: ["ADMIN", "DOCTOR", "STAFF"],
  },
  {
    title: "Doctors",
    href: "/doctors",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    title: "Specialties",
    href: "/specialties",
    icon: ClipboardList,
    roles: ["ADMIN"],
  },
  {
    title: "Lab Results",
    href: "/lab-results",
    icon: FlaskConical,
    roles: ["ADMIN", "DOCTOR"],
  },
  {
    title: "Prescriptions",
    href: "/prescriptions",
    icon: Pill,
    roles: ["ADMIN", "DOCTOR"],
  },
  {
    title: "Billing & Invoices",
    href: "/billing",
    icon: CreditCard,
    roles: ["ADMIN", "STAFF"],
  },
  {
    title: "Medical Records",
    href: "/medical-records",
    icon: ClipboardList,
    roles: ["ADMIN", "DOCTOR"],
  },
  {
    title: "Imaging",
    href: "/imaging",
    icon: FileImage,
    roles: ["ADMIN", "DOCTOR"],
  },

  {
    title: "System Settings",
    href: "/settings",
    icon: Settings,
    roles: ["ADMIN"],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Failed to fetch user:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  const filteredNavItems = loading
    ? []
    : navItems.filter((item) => user && item.roles.includes(user.role.toUpperCase()))

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar shadow-xl">
      <SidebarHeader className="h-auto py-5 border-b border-sidebar-border/50 px-4 bg-linear-to-b from-sidebar-accent/30 to-transparent">
        <div className="flex items-center gap-3.5 group">
          <div className="p-2.5 bg-linear-to-br from-primary/20 to-primary/5 rounded-2xl shrink-0 shadow-lg shadow-primary/5 border border-primary/10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 mb-0.5 drop-shadow-sm">
              Appointment
            </span>
            <span className="text-sm font-black tracking-tight text-sidebar-foreground leading-none whitespace-normal mb-1.5" title="Doctor's Appointments">
              Management System
            </span>
            <div className="flex items-center gap-1.5">
              <div className="h-px w-4 bg-primary/30" />
              <span className="text-[9px] font-bold text-muted-foreground/80 uppercase tracking-wider whitespace-normal" title="Supported by Parth Gautam Foundation">
                Parth Gautam Foundation
              </span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-full animate-pulse bg-sidebar-accent/50 rounded-xl" />
            ))}
          </div>
        ) : (
          <SidebarMenu className="space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    )}
                  >
                    <Link href={item.href}>
                      <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-primary/70")} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4 space-y-4">
        <div className="flex gap-2">
          {user && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full flex-1 flex items-center justify-start gap-3 h-auto py-2 px-3 rounded-xl border-sidebar-border/50 bg-sidebar-accent/50 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold border border-primary/20 shadow-inner group-hover:text-primary">
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col items-start min-w-0 text-left">
                    <span className="text-sm font-bold text-sidebar-foreground truncate w-full group-hover:text-primary">
                      {user.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-500" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider group-hover:text-primary">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] glass-premium border-none shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 -z-10 text-primary">
                  <UserIcon className="h-32 w-32 rotate-12" />
                </div>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">User Profile</DialogTitle>
                  <DialogDescription className="font-medium text-muted-foreground">
                    Your account details and permissions
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-6 space-y-6">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <div className="h-16 w-16 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xl font-black shadow-lg">
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-foreground">{user.name}</h3>
                      <p className="text-sm font-bold text-primary flex items-center gap-1">
                        <ShieldCheck className="h-4 w-4" />
                        {user.role}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/20 dark:border-slate-800">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Email Address</p>
                        <p className="text-sm font-bold">{user.email}</p>
                      </div>
                    </div>

                    {(user.role === "DOCTOR" || user.role === "STAFF") && (
                      <ChangePasswordDialog
                        trigger={
                          <Button variant="outline" className="w-full justify-start gap-3 rounded-xl border-primary/20 hover:bg-primary/5 transition-all">
                            <Lock className="h-4 w-4" />
                            Change My Password
                          </Button>
                        }
                      />
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          <Button
            onClick={handleLogout}
            variant="outline"
            size="icon"
            className="h-auto min-h-[48px] w-12 shrink-0 rounded-xl border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-300 shadow-sm"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

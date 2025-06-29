import type { ReactNode } from "react"
import DashboardSidebar from "@/components/dashboard/sidebar"
import DashboardHeader from "@/components/dashboard/header"
import AuthCheck from "@/components/auth-check"

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <AuthCheck>
            <div className="flex min-h-screen bg-slate-50">
                <DashboardSidebar />
                <div className="flex-1 flex flex-col">
                    <DashboardHeader />
                    <main className="flex-1 p-6">{children}</main>
                </div>
            </div>
        </AuthCheck>
    )
}

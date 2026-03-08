"use client"
import "@/app/globals.css";

import {useCallback, useEffect, useMemo, useState} from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {dashboardNav} from "@/app/dashboard/nav-config";
import {usePathname, useRouter} from "next/navigation";
import {CompanySetupWizard} from "@/components/wizard/company-setup-wizard";
import {useSelector} from "react-redux";
import {selectCurrentUser} from "@/lib/features/auth/authSlice";


function getTitleByPath(pathname: string) {
    const items = [
        ...dashboardNav.navMain,
        ...dashboardNav.navSecondary,
        ...dashboardNav.documents,
    ];

    const match = items.find(item =>
        pathname === item.url || pathname.startsWith(`${item.url}/`)
    );

    return match?.title || "Dashboard";
}

export default function DashboardLayout({children,}: {
    children: React.ReactNode
}) {

    const pathname = usePathname()
    const title = useMemo(() => getTitleByPath(pathname), [pathname])
    const [open, setOpen] = useState(true)

    // Редирект на страницу логина, если пользователь не авторизован
    const router = useRouter()
    const user = useSelector(selectCurrentUser)

    useEffect(() => {
        if (!user) {
            router.replace("/auth/login")
        }
    }, []);

    return (
        <SidebarProvider
            style={{
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties}
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader title={title} />
                <CompanySetupWizard />
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}